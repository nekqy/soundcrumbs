var
   app = require('./server/app'),
   filesApi = require('./server/filesApi');

filesApi.init(app.app);