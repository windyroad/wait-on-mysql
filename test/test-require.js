const qc = require('@windyroad/quick-containers-js')
const Docker = require('dockerode')
const waitPort = require('wait-port')
const mysql = require('mysql')
const waitOnMysql = require('../lib')
const promiseFinally = require('promise.prototype.finally')
promiseFinally.shim()

const docker = new Docker()

const PORT = '3107'
const MYSQL_OPTS = {
  host: 'localhost',
  port: PORT,
  user: 'root',
  password: 'my-secret-pw'
}

qc.ensurePulled(docker, 'mysql:5.7.26')
  .then(() => {
    console.log('pulled')
    return qc.ensureStarted(
      docker,
      {
        Image: 'mysql:5.7.26',
        Tty: false,
        ExposedPorts: {
          '3306/tcp': {}
        },
        HostConfig: {
          PortBindings: { '3306/tcp': [{ HostPort: PORT }] }
        },
        Env: ['MYSQL_ROOT_PASSWORD=my-secret-pw'],
        name: `mysql-5.7.26-${PORT}`
      },
      () => {
        return waitPort({
          timeout: 60000,
          host: 'localhost',
          port: parseInt(PORT)
        })
      }
    )
  })
  .then((conainter) => {
    waitOnMysql(
      {
        host: 'localhost',
        port: PORT,
        user: 'root',
        password: 'my-secret-pw'
      },
      {
        timeout: 60000
      }
    ).then(() => {
      console.log('started')
      const mysqlConn = mysql.createConnection(MYSQL_OPTS)
      return new Promise(function (resolve, reject) {
        mysqlConn.connect(function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(mysqlConn)
          }
        })
      })
    })
      .then(mysqlConn => {
        console.log('connected')
        return new Promise(function (resolve, reject) {
          console.log('quering')
          mysqlConn.query('select 1 from dual', function (err, result, fields) {
            if (err) {
              reject(err)
            } else {
              console.log(result)
              resolve(mysqlConn, result, fields)
            }
          })
        })
      })
      .then(mysqlConn => {
        mysqlConn.end()
      })
      .finally(() => {
        console.log('stopping container...')
        return conainter.stop().then(() => console.log('...stopped'))
      })
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
