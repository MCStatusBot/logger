# logger
a simple logger that adds times log  type and will also add the logs to a file


### setup

make an env file that will contain your config options

#### MCSB_LOGGER_PATH (string)

this is the path you will store all your log files in
- starting it with ./ will make it relative to your project directory
- starting it with / will make it relative to your root and you have to specify a full path

it is a good idea to place it in a logs direcotry because it makes multible archive files which can get messy

default: ./logs

#### MCSB_LOGGER_FILE_PREFIX (boolean)

if you want your log files to be prefixed with the type of log it is eg success, error.

default: false

##### example .env file
```env
MCSB_LOGGER_PATH=./logs
MCSB_LOGGER_FILE_PREFIX=true
```

install the module

```
npm i mcstatusbot-logger
```

### example

```js
require('dotenv').config();
const logger = require('mcstatusbot-logger');


logger.sucess("you are now using logger by 404invalid-user@mcstatusbot.site");
logger.info("you are now using logger by 404invalid-user@mcstatusbot.site");
```


### docs

#### `.sucess([string: message <default: "">], [boolean: log to file <default:true>])`

sends a success message 


#### `.info([string: message <default: "">], [boolean: log to file <default:true>])`

sends a info message 


#### `.warn([string: message <default: "">], [boolean: log to file <default:true>])`

sends a warn message 


#### `.error([string: message <default: "">], [boolean: log to file <default:true>])`

sends a error message 


#### `.crash([string: message <default: "">], [boolean: log to file <default:true>])`

sends a crash message 