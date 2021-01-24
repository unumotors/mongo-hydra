#!/bin/bash -ex

# ** WARNING: This is not production grade tls handling ***

# Creates certificate chain for use with mongo
# The following steps to
# 1. Creates a CA
# 2. Creates a server key + csr and gets it signd by CA
# 3. Generates client key + csr and requests its signed by CA
#

export DIR_ROOT="$( cd "$( dirname "$0" )" && pwd )"

# Clean up
CERTS_DIR=${DIR_ROOT}/certs
rm -rf ${CERTS_DIR}/*

# Create CA
mkdir -p "${CERTS_DIR}/ca"
openssl genrsa -out "${CERTS_DIR}/ca/ca.key" 2048
openssl req -x509 -new  -subj '/O=hydra/OU=Root/CN=mongodb' -key "${CERTS_DIR}/ca/ca.key" -days 365 -out "${CERTS_DIR}/ca/ca.crt"

# Generate a server cert and sign it using it the previous CA
mkdir -p "${CERTS_DIR}/server"
openssl genrsa -out "${CERTS_DIR}/server/mongodb.key" 2048
openssl req -new -subj '/O=hydra/OU=Servers/CN=localhost' -key "${CERTS_DIR}/server/mongodb.key" -out "${CERTS_DIR}/server/mongodb.csr"
openssl x509 -req -in "${CERTS_DIR}/server/mongodb.csr" -CA "${CERTS_DIR}/ca/ca.crt" -CAkey "${CERTS_DIR}/ca/ca.key" -CAcreateserial -out "${CERTS_DIR}/server/mongodb.crt" -days 365
cat "${CERTS_DIR}/server/mongodb.key" "${CERTS_DIR}/server/mongodb.crt" > "${CERTS_DIR}/server/mongodb.pem"
#mv "${DIR_ROOT}/.srl" "${CERTS_DIR}/server-srl"

# Generate a client cert and sign it with the previous CA
mkdir -p "${CERTS_DIR}/client"
openssl genrsa -out "${CERTS_DIR}/client/client.key" 2048
openssl req -new -subj '/O=hydra/OU=Clients/CN=localhost' -key "${CERTS_DIR}/client/client.key" -out "${CERTS_DIR}/client/client.csr"
openssl x509 -req -in "${CERTS_DIR}/client/client.csr" -CA "${CERTS_DIR}/ca/ca.crt" -CAkey "${CERTS_DIR}/ca/ca.key" -CAcreateserial -out "${CERTS_DIR}/client/client.crt" -days 365
cat "${CERTS_DIR}/client/client.key" "${CERTS_DIR}/client/client.crt" > "${CERTS_DIR}/client/client.pem"
#mv "${DIR_ROOT}/.srl" "${CERTS_DIR}/client-srl"
