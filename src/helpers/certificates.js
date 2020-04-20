const forge = require('node-forge')

function getSubjectRFC2253FromCertificate(pem) {
  const certificate = forge.pki.certificateFromPem(pem)
  const subject = certificate.subject.attributes
    .reverse()
    .map((att) => `${att.shortName}=${att.value}`).join(',')
  return subject
}

module.exports = {
  getSubjectRFC2253FromCertificate
}
