import waitPort from 'wait-port'
import chalk from 'chalk'
import mysql from 'mysql'

function waitOnMysql (mysqlOpts, waitPortOpts = {}, keepAlive = false) {
  const timeout = waitPortOpts.timeout || 0
  const interval = waitPortOpts.interval || 100
  const startTime = new Date()
  const mergedWaitPortOpts = Object.assign(waitPortOpts, { port: parseInt(mysqlOpts.port), host: mysqlOpts.host })

  return waitPort(mergedWaitPortOpts).then(() => {
    process.stdout.write(`Waiting for MySQL connection on ${mysqlOpts.host}:${mysqlOpts.port}`)
    return new Promise((resolve, reject) => {
      const loop = () => {
        process.stdout.write('.')
        let connection = mysql.createConnection(mysqlOpts)

        connection.connect(function (err) {
          if (err) {
            if (timeout && (new Date() - startTime) > timeout) {
              console.log(chalk.red('\nTimeout'))
              return reject(err)
            }
            //  Run the loop again.
            return setTimeout(loop, interval)
          }
          console.log(chalk.green('\nMySQL Connected!'))
          if (!keepAlive) {
            connection.end((err) => {
              if (err) {
                return reject(err)
              } else {
                resolve(connection)
              }
            })
          } else {
            return resolve(connection)
          }
        })
      }

      loop()
    })
  })
}

module.exports = waitOnMysql
