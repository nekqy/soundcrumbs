var
   app = require('./server/app'),
   filesApi = require('./server/filesApi'),
   firebaseApi = require('./server/firebaseApi');

filesApi.init(app.app);
firebaseApi.init(app.app);