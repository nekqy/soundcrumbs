define([], function() {
    function VKApi() {
        var settings = {};

        this.setSettings = function(vkSettings) {
            settings = vkSettings;
        };

        this.$get = ['$rootScope', '$q', '$log', '$timeout', 'VK', function($rootScope, $q, $log, $timeout, VK) {
            if(typeof VK === "undefined")
                throw new Error("You forgot include VK script");
            if(typeof settings.apiId === "undefined" && typeof settings.apiVersion === "undefined")
                throw new Error("You forgot initialize settings in a config function");
            VK.init({ apiId: settings.apiId, apiVersion: settings.apiVersion });

            var authenticate = function() {
                return $q(function(resolve, reject) {
                    var responsed = false;
                    VK.Auth.getLoginStatus(function(response) {
                        responsed = true;
                        if(response.session) {
                            var mid = response.session.mid;
                            $timeout(function() {return resolve(mid)}, 0);
                        } else {
                            VK.Auth.login(function(response) {
                                var mid = response.session.mid;
                                $timeout(function() {return resolve(mid)}, 0);
                                return $log.info(response, 'response');
                            }, 2 + 4 + 8 + 16);
                        }
                    });
                    setTimeout(function() {
                        if (!responsed) {
                            VK.Auth.login(function(response) {
                                var mid = response.session.mid;
                                $timeout(function() {return resolve(mid)}, 0);
                                return $log.info(response, 'response');
                            }, 2 + 4 + 8 + 16);
                        }
                    }, 5000);
                });
            };

            var getMid = function() {return authenticate().then(function(mid) {
                return mid;
            })};

            var getSession = function() {
                return authenticate().then(function(mid) {
                        return $q(function(resolve, reject) {
                            if (VK.Auth.getSession() != null) {
                                var session = VK.Auth.getSession();

                                if (session.mid === mid) {
                                    resolve(session);
                                } else {
                                    reject(new Error("This session does not correct for current user"));
                                }
                            }
                        })
                    });
            };

            var getUser = function(fields, uid) {
                return authenticate().then(function(mid) {
                        return $q(function(resolve, reject) {
                            VK.api('users.get', {
                                user_ids: typeof uid === 'undefined' ? mid : uid.join(","),
                                fields: fields.join(',')
                            }, function(response) {
                                if (response.response) {
                                    $timeout(function() { return resolve(typeof uid !== 'undefined' ? response.response : response.response[0]) }, 0);
                                }
                            });
                        })
                    });
            };

            //var getFollowers = params => authenticate().then(mid => {
            //    params = params || {};
            //    params.mid = mid;
            //
            //    return $q((resolve, reject) => {
            //        VK.api('users.getFollowers', params, response => {
            //            if(response.response) {
            //                $timeout(() => resolve(response.response), 0);
            //            }
            //        });
            //    })
            //});

            var getAudio = function(params) {
                return authenticate().then(function(mid) {
                    params = params || {};
                    params.mid = mid;

                    return $q(function(resolve, reject) {
                        VK.api('audio.search', params, function(response) {
                            if (response.response) {
                                $timeout(function() {return resolve(response.response)}, 0);
                            }
                        });
                    })
                });
            };

            //var getFriends = fields => authenticate().then(mid =>
            //    $q((resolve, reject) => {
            //        VK.api('friends.get', {
            //            user_id: mid,
            //            fields: fields.join(',')
            //        }, response => {
            //            if (response.response) {
            //                $timeout(() => resolve(response.response), 0);
            //            }
            //        });
            //    })
            //);

            var audioSave = function(fields) {
                return authenticate().then(function(mid) {
                    fields = fields || {};
                    fields.mid = mid;

                    return $q(function(resolve, reject) {
                        VK.api('audio.save', fields, function(response) {
                            if (response.response) {
                                $timeout(function() { return resolve(response.response)}, 0);
                            } else {
                                $timeout(function() { return reject(response) }, 0);
                            }
                        });
                    })
                });
            };

            //var photosSearch = (lat, long) => authenticate().then(mid =>
            //    $q((resolve, reject) => {
            //        VK.api('photos.search', { lat, long }, (response) => {
            //            if (response.response) {
            //                $timeout(() => resolve(response.response), 0);
            //            }
            //        });
            //    })
            //);

            var getUploadServer = function() {
                return authenticate().then(function(mid) {
                        return $q(function(resolve, reject) {
                            VK.api('audio.getUploadServer', {}, function(response) {
                                if (response.response) {
                                    $timeout(function() {return resolve(response.response)}, 0);
                                }
                            });
                        })
                    }
                );
            };

            return {
                authenticate: authenticate,
                getMid: getMid,
                getUser: getUser,
                audioSave: audioSave,
                getSession: getSession,
                //getFollowers,
                getAudio: getAudio,
                //getFriends,
                //photosSearch,
                getUploadServer: getUploadServer
            };
        }];
    }

    return VKApi;
});
