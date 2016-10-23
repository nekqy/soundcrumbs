define([], function() {
   function UserDetailCtrl($scope, user) {
       var self = this;
       self.$scope = $scope;
       self.user = user;
   }

   return UserDetailCtrl;
});
