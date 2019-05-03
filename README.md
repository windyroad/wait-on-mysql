# wait-on-mysql

wait-on-mysql is a Node.js API which will wait for a MySQL connection to become available

# Why

When I test code that needs a MySQL database, I'll have it automatically start a MySQL instance if it's not already running. This utility let's
me wait until the database connection is available before running the tests

# Installation

```
npm install @windyroad/wait-on-mysql --save-dev
```

# Usage

## waitOnMysql(mysqlConnectionOpts, waitPortOpts, keepAlive)

`waitOnMysql` returns a promise that resolves when a connection is successfully made to to mysql using the `mysqlConnectionOpts` using [`mysql.createConnection()` and `connection.connect()`](https://github.com/mysqljs/mysql#establishing-connections). See [`mysqlConnectionOpts`](https://github.com/mysqljs/mysql#connection-options) for connection details.

`waitOnMysql` first is uses [`wait-port`](https://www.npmjs.com/package/wait-port) to wait for tcp connection on the `host` & `port` specified in `mysqlConnectionOpts`. `waitPortOpts` is passed to [`wait-port`](https://www.npmjs.com/package/wait-port) for additional [options](https://github.com/dwmkerr/wait-port#api)

`waitOnMysql` will keep close the connection `keepAlive`

`waitOnMysql` will reject if a `timeout` is specified and is exceeded.

### Example

```js
import waitOnMysql from '@windyroad/wait-on-mysql';
// or const waitOnMysql = require('@windyroad/wait-on-mysql')

waitOnMysql(
  {
    host: 'localhost',
    port: PORT,
    user: 'root',
    password: 'my-secret-pw',
  },
  {
    timeout: 60000,
  },
)
  .then(() => {
    // database is available
    // start test run, etc
  })
  .catch(err => {
    // timed out
  });
```

#### Keep Alive

```js
import waitOnMysql from '@windyroad/wait-on-mysql';
// or const waitOnMysql = require('@windyroad/wait-on-mysql')
waitOnMysql(
  {
    host: 'localhost',
    port: PORT,
    user: 'root',
    password: 'my-secret-pw',
  },
  {
    timeout: 60000,
  },
  true,
)
  .then(connection => {
    // database is available.
    // connection can be used to do queries
    // ...
    connection.end();
  })
  .catch(err => {
    // timed out
  });
```
