/* eslint no-await-in-loop: 0 */

const { compare } = require('../../helpers/array')
const logger = require('winston')
const settings = require('../../config/settings').userManagement

class Roles {
  constructor(client) {
    this.client = client
  }

  roleFromYamlFormat(role) {
    let { name, privileges, roles } = role
    if (!roles) roles = []
    // Map privileges
    privileges = privileges.map(privilege => {
      let p = {}
      p.resource = {
        db: privilege.database,
        collection: privilege.collection || ''
      }
      p.actions = privilege.actions
      return p
    })
    return { name, privileges, roles }
  }

  async addRoles(rolesToAdd) {
    for (let index = 0; index < rolesToAdd.length; index++) {
      const { name, privileges, roles } = this.roleFromYamlFormat(rolesToAdd[index])
      await this.client.commands.db.createRole(name, privileges, roles)
    }
  }
  // True if equal
  static compareRoles(role1, role2) {
    const privileges = role1.privileges.every(p1 =>
      role2.privileges.some(p2 => p2.db == p1.db && compare(p2.actions, p1.actions) && p1.collection == p2.collection))
    if (!privileges) return false

    const roles = role1.roles.every(r1 =>
      role2.roles.some(r2 => r1.db == r2.db && r1.role == r2.role))
    if (!roles) return false

    // TODO add authenticationRestrictions
    return true
  }

  async updateRoles(rolesToUpdate) {
    for (let index = 0; index < rolesToUpdate.length; index++) {
      const updateRole = this.roleFromYamlFormat(rolesToUpdate[index])
      const { name, privileges, roles } = updateRole
      const serverRole = await this.serverRolesMap[name]
      // Check if anything significant changed
      if (Roles.compareRoles(serverRole, updateRole)) {
        continue
      }
      // Ideally we would use this function, but db.updateRole() does not work
      // await this.client.commands.db.updateRole(name, updateData)
      await this.client.commands.db.dropRole(name)
      await this.client.commands.db.createRole(name, privileges, roles)
      logger.info(`Role ${name} was updated`)
    }
  }

  async removeRoles(rolesToRemove) {
    for (let index = 0; index < rolesToRemove.length; index++) {
      const name = rolesToRemove[index]
      await this.client.commands.db.dropRole(name)
    }
  }

  async applyRoles(rolesToApply) {
    let rolesToApplyMap = {}
    rolesToApply.forEach(role => {
      rolesToApplyMap[role.name] = role
    })
    const roleNamesToApply = rolesToApply.map(r => r.name)

    const toBeAdded = roleNamesToApply.filter(x => !this.serverRoles.includes(x))
    const toBeRemoved = this.serverRoles.filter(x => !roleNamesToApply.includes(x))
    const alreadyExisting = roleNamesToApply.filter(value => this.serverRoles.indexOf(value) != -1)

    function getRolesObjectsForArray(roles) {
      return roles.map(r => rolesToApplyMap[r])
    }

    if (toBeAdded.length) {
      logger.info(`Adding roles ${toBeAdded}`)
      await this.addRoles(getRolesObjectsForArray(toBeAdded))
    }
    if (settings.removeRoles && toBeRemoved.length) {
      logger.info(`Removing roles ${toBeRemoved}`)
      await this.removeRoles(toBeRemoved)
    }
    if (alreadyExisting.length) {
      await this.updateRoles(getRolesObjectsForArray(alreadyExisting))
    }
  }

  async cacheRoles() {
    // Roles
    const serverRoles = await this.client.commands.db.getRoles()
    this.serverRoles = serverRoles.map(r => r.role)
    this.serverRolesMap = {}
    Object.values(serverRoles).forEach(role => {
      this.serverRolesMap[role.role] = role
    })
  }

  async apply(config) {
    logger.info('')
    logger.info('**** Apply roles configuration')
    await this.cacheRoles()
    // Collect all roles
    let allRoles = []
    config.forEach(user => {
      if (user.roles) allRoles = allRoles.concat(user.roles)
    })
    const customRoles = allRoles.filter(r => r.name)
    await this.applyRoles(customRoles)
  }
}

module.exports = Roles
