window.mobilecheck = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

var authApp = angular.module("slideApp", ["ngRoute", "ngCookies"]);

authApp.config(function ($routeProvider, $locationProvider, $httpProvider) {

    $routeProvider
        .when("/", {
            templateUrl: "/pages/index.html",
            controller: "indexController"
        })
        .when("/:session", {
            templateUrl: "/pages/remote.html",
            controller: "remoteController"
        })


    $locationProvider.html5Mode(true);

    // Required for session cookies to be sent in $http
    $httpProvider.defaults.withCredentials = true;
});

authApp.controller("slideController", ["$scope", "$route", "$cookies", "$location", "$http", "$interval", "$timeout", "$window", function ($scope, $route, $cookies, $location, $http, $interval, $timeout, $window) {
    window.__$scope = $scope;

    $scope.session = {
        session: "",
        qr: "",
        bookmarkContent: "",
        type: ""
    };
    //TODO: disable some (most) settings for the host
    $scope.settings = {
        navigationType: 'button',
        vibration: true,
        laserCalibration: {
            center: {
                yaw: 0,
                pitch: 0
            },
            range: {
                yaw: 90,
                pitch: 90
            }
        },

        put: function (name, value) {
            $timeout(function () {
                $scope.settings[name] = value;
                localStorage.setItem("rs-settings", JSON.stringify($scope.settings));
            });
        },
        save: function () {
            localStorage.setItem("rs-settings", JSON.stringify($scope.settings));
        }
    };

    // Load settings
    var storedSettings = JSON.parse(localStorage.getItem("rs-settings")) || {};
    $.extend($scope.settings, storedSettings);


    $scope.openSettings = function () {
        $("#settingsModal").modal("show");
    };


    // Non-settings stuff
    $scope.chromeExtensionId = "bablpajeibomldijmnkliinaealllklb";

    $scope.isMobile = function () {
        return window.mobilecheck();
    };
    $scope.isDesktop = function () {
        return !window.mobilecheck();
    };

    $scope.statusIcon = {
        type: 'question',
        color: 'orange',
        message: '',
        messageVisible: false,
        hideTimeout: undefined,
        showMessage: function (type, color, msg, timeout, doneCallback) {
            $timeout(function () {
                if (type)
                    $scope.statusIcon.type = type;
                if (color)
                    $scope.statusIcon.color = color;

                $scope.statusIcon.messageVisible = false;
                if (msg) {
                    $scope.statusIcon.message = msg;
                    $scope.statusIcon.messageVisible = true;
                }
                if ($scope.settings.vibration) {
                    if (type == "times") {// error
                        window.navigator.vibrate([100, 30, 100]);
                    } else {// info
                        window.navigator.vibrate(200);
                    }
                }

                if (timeout) {
                    $timeout.cancel($scope.statusIcon.hideTimeout);
                    $timeout(function () {
                        $scope.statusIcon.messageVisible = false;
                        if (doneCallback)
                            doneCallback();
                    }, timeout);
                } else {
                    if (doneCallback)
                        doneCallback();
                }
            });
        },
        hideMessage: function () {
            $scope.statusIcon.messageVisible = false;
        }
    };

    $scope.qrCodeScan = {
        start: function () {
            $("#qrScanner").empty();

            $("#qrScannerModal").modal("show");
            $timeout(function () {
                $scope.qrCodeScan.status = "scanning";
                $("#qrScanner").html5_qrcode(function (data) {
                    console.info(data)
                    //TODO show different status on invalid data
                    $timeout(function () {
                        $scope.qrCodeScan.status = "success";
                        if (data.startsWith("https://remote-sli.de/")) {
                            $timeout(function () {
                                window.location = data;
                            }, 100);
                        }
                    }, 50);
                }, function (error) {
                    console.warn("error:")
                    console.warn(error)
                }, function (videoError) {
                    console.warn("Video error:")
                    console.warn(videoError);
                    $timeout(function () {
                        $scope.qrCodeScan.status = "videoError";
                    })
                })
            }, 250);
        },
        stop: function () {
            $scope.qrCodeScan.status = "cancelled";
            $("#qrScanner").html5_qrcode_stop()
        },
        cameraToggle: false,// switch front/back camera
        flipCamera: function () {
            $scope.qrCodeScan.cameraToggle = !$scope.qrCodeScan.cameraToggle;
        },
        status: 'none'
    }

//TODO: move to remote
    $scope.deviceOrientation = {
        lastAlpha: 0,// Yaw
        lastBeta: 0,// Pitch
        lastGamma: 0,// Roll,
        currentYaw: 0,
        currentPitch: 0,
        previousOrientations: [],
        center: {
            yaw: 0,
            pitch: 0
        },
        range: {
            yaw: 0,
            pitch: 0
        },
        calibration: {
            angles: {
                center: [],
                topLeft: [],
                topRight: [],
                bottomLeft: [],
                bottomRight: []
            },
            active: false,
            step: "center",
            toggleCalibration: function () {
                if (!$scope.deviceOrientation.calibration.active) {
                    $scope.deviceOrientation.calibration.startCalibration();
                } else {
                    $scope.deviceOrientation.calibration.active = false;
                    $scope.deviceOrientation.calibration.showOrHidePosition("hide", "all");
                }
            },
            startCalibration: function () {
                $scope.deviceOrientation.calibration.step = "center";// reset step
                $scope.deviceOrientation.calibration.active = true;

                $scope.deviceOrientation.calibration.showOrHidePosition("show", "start");
                $scope.deviceOrientation.calibration.showOrHidePosition("show", "center");

                $("#settingsModal").modal("hide");
            },
            onCalibrationFinished: function () {
                $scope.deviceOrientation.calibration.active = false;
                $scope.deviceOrientation.calibration.showOrHidePosition("hide", "all");

                // Center
                $scope.deviceOrientation.center.yaw = $scope.deviceOrientation.calibration.angles.center[0];
                $scope.deviceOrientation.center.pitch = $scope.deviceOrientation.calibration.angles.center[1];

                // Ranges
                $scope.deviceOrientation.range.yaw = Math.abs((($scope.deviceOrientation.calibration.angles.topLeft[0] + $scope.deviceOrientation.calibration.angles.bottomLeft[0]) / 2) - (($scope.deviceOrientation.calibration.angles.topRight[0] + $scope.deviceOrientation.calibration.angles.bottomRight[0]) / 2));
                $scope.deviceOrientation.range.pitch = Math.abs((($scope.deviceOrientation.calibration.angles.topLeft[1] + $scope.deviceOrientation.calibration.angles.topRight[1]) / 2) - (($scope.deviceOrientation.calibration.angles.bottomLeft[1] + $scope.deviceOrientation.calibration.angles.bottomRight[1]) / 2));

                console.info("Center: " + $scope.deviceOrientation.center.yaw + ", " + $scope.deviceOrientation.center.pitch)
                console.info("Range:  " + $scope.deviceOrientation.range.yaw + ", " + $scope.deviceOrientation.range.pitch)

                $scope.settings.laserCalibration = {
                    center: $scope.deviceOrientation.center,
                    range: $scope.deviceOrientation.range
                };
                $scope.settings.save();

                $scope.deviceOrientation.calibration.sendRange($scope.deviceOrientation.range.yaw, $scope.deviceOrientation.range.pitch);
            },
            nextStep: function () {
                var currentStep = $scope.deviceOrientation.calibration.step;
                var nextStep = undefined;
                if (currentStep == 'center') {
                    nextStep = "topLeft";
                } else if (currentStep == 'topLeft') {
                    nextStep = "topRight";
                } else if (currentStep == 'topRight') {
                    nextStep = "bottomLeft";
                } else if (currentStep == 'bottomLeft') {
                    nextStep = "bottomRight";
                }
                $scope.deviceOrientation.calibration.step = nextStep;
                if (currentStep) {
                    $scope.deviceOrientation.calibration.showOrHidePosition("hide", currentStep);
                }
                if (nextStep) {
                    $scope.deviceOrientation.calibration.showOrHidePosition("show", nextStep);
                } else {
                    $scope.deviceOrientation.calibration.onCalibrationFinished();
                }
            },
            onCalibrationStepFinished: function () {
                if (!$scope.deviceOrientation.calibration.active) {
                    return;
                }
                $scope.deviceOrientation.calibration.angles[$scope.deviceOrientation.calibration.step] = [$scope.deviceOrientation.lastAlpha, $scope.deviceOrientation.lastBeta];
                console.log(JSON.stringify($scope.deviceOrientation.calibration.angles))
                $timeout(function () {
                    $scope.deviceOrientation.calibration.nextStep();
                }, 250);
            }
        },
        updateYawOffset: function () {// Use the current device yaw as the new offset
            $scope.settings.yawOffset = $scope.deviceOrientation.center.yaw = $scope.deviceOrientation.lastAlpha;
            console.info("New Yaw offset: " + $scope.deviceOrientation.lastAlpha);
            $scope.settings.save()
        },
        getVector: function () {
            if ($scope.deviceOrientation.center.yaw == 0) {
                $scope.deviceOrientation.center = $scope.settings.laserCalibration.center;
                $scope.deviceOrientation.range = $scope.settings.laserCalibration.range;
            }
//                        return [$scope.deviceOrientation.lastAlpha, $scope.deviceOrientation.lastBeta, $scope.deviceOrientation.lastGamma]
//                        var pitch = ($scope.deviceOrientation.lastBeta * Math.PI) / 180;
//                        var yaw = ($scope.deviceOrientation.lastAlpha * Math.PI) / 180;
//                        return [
//                                Math.sin(pitch)*Math.cos(yaw),
//                                Math.sin(pitch)*Math.sin(yaw),
//                                Math.cos(pitch)
//                        ]

            var yawCenter = $scope.deviceOrientation.center.yaw;
            var pitchCenter = $scope.deviceOrientation.center.pitch;

            var yawRange = $scope.deviceOrientation.range.yaw;
            var pitchRange = $scope.deviceOrientation.range.pitch;

            var yaw = $scope.deviceOrientation.lastAlpha;// yaw
            var pitch = $scope.deviceOrientation.lastBeta;// pitch

            //TODO: change 45 to a calibrated value (angle from center)
            yaw -= yawCenter;
            $scope.deviceOrientation.currentYaw = yaw;
            if (yaw > (yawRange))yaw = (yawRange);
            if (yaw < (-(yawRange)))yaw = (-(yawRange));
            yaw += (yawRange / 2);

            // taking 0 as center
            //TODO: change 45 to a calibrated value (angle from center)
            pitch -= pitchCenter;
            $scope.deviceOrientation.currentPitch = pitch;
            if (pitch > (pitchRange))pitch = (pitchRange);
            if (pitch < (-(pitchRange)))pitch = (-(pitchRange));
            pitch += (pitchRange / 2);

            //TODO: also consider the 'gamma' value for a more accurate pitch/yaw
            // https://engineering.stackexchange.com/questions/3348/calculating-pitch-yaw-and-roll-from-mag-acc-and-gyro-data


            return [
                yaw,
                pitch
            ]
        }
    };
}]);

authApp.controller("indexController", ["$scope", "$http", "$cookies", "$timeout", "$interval", "$location", function ($scope, $http, $cookies, $timeout, $interval, $location) {
    $http.get("/api/session").then(function (data) {
        data = data.data;
        $scope.session = data;
        $http.get("/res/bookmark.js").then(function (data) {
            data = data.data;
            console.log(data)
            data = data.replace(":sessionId:", $scope.session.session);
            $scope.session.bookmarkContent = data;
            $("#session-bookmark").attr("href", data);

            // Wait for socket init
            var socket = io();
            socket.on("init", function (data) {
                console.log("init: " + JSON.stringify(data));
                if (data.state == "start") {
                    console.info("Initializing Session #" + $scope.session.session)
                    $timeout(function () {
                        socket.emit("init", {iAm: "observer", session: $scope.session.session});
                    }, 500);
                } else if (data.state == "success") {
                    console.info("Session initialized.")
                    $timeout(function () {
                        $scope.session.initialized = true;
                        $scope.session.type = data.youAre;
                        $scope.statusIcon.showMessage("check", "lime");

                        // Notify extension
                        chrome.runtime.sendMessage($scope.chromeExtensionId, {session: $scope.session}, function () {

                        });
                    });
                } else if (data.state == "not_found") {// This should be impossible here, since the observer generates the new session ID
                    console.warn("Session not found");
                    $timeout(function () {
                        $scope.statusIcon.showMessage("times", "red", "Session not found", 20000);
                    })
                    $timeout(function () {
                        window.location.reload(true);
                    }, 500);
                }
            })
            socket.on("info", function (data) {
                console.log(data);
                if (data.type == 'client_connected') {
                    if (data.clientType == 'remote') {
                        $scope.statusIcon.showMessage("check", "lime", "Remote connected", 2500);
                    } else if (data.clientType == 'host') {
                        $scope.statusIcon.showMessage("check", "lime", "Host connected", 2500);
                    }
                }
                if (data.type == 'client_disconnected') {
                    if (data.clientType == 'remote') {
                        $scope.statusIcon.showMessage("times", "red", "Remote disconnected", 2000, function () {
                            $scope.statusIcon.showMessage("check", "lime");
                        });
                    } else if (data.clientType == 'host') {
                        $scope.statusIcon.showMessage("times", "red", "Host disconnected", 2000, function () {
                            $scope.statusIcon.showMessage("check", "lime");
                        });
                    }
                }
            })
        })
    });
}]);

authApp.controller("remoteController", ["$scope", "$http", "$cookies", "$timeout", "$interval", "$location", "$routeParams", "$window", function ($scope, $http, $cookies, $timeout, $interval, $location, $routeParams, $window) {
    var socket = io();
    $scope.session.session = $routeParams.session;

    $scope.sendControl = function (keyCode, keys) {
        socket.emit("control", {keyCode: keyCode, keys: keys});
    };

    // (mobile)
    $(document).swipe({
        swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
            if ($scope.settings.navigationType != 'swipe')
                return;
            event.preventDefault();

            console.log(event);
            console.log(direction);
            console.log(distance);

            if (direction == "right")
                $scope.sendControl(37);//left
            if (direction == "down")
                $scope.sendControl(38);//up
            if (direction == "left")
                $scope.sendControl(39);//right
            if (direction == "up")
                $scope.sendControl(40);//down
        },
        tap: function (event, target) {
            console.log(target)
            console.log(target == document);
            console.log(target == $(document));
            console.log($(target) == $(document))
            console.log(target.id)
            if ($scope.settings.navigationType != 'swipe')
                return;
            if (target.id != 'outer-html-wrapper' && target.id != 'swipe-controls')// ignore taps on any other controls
                return;
            $scope.sendControl(32);//space
        }
    });


    // Init
    socket.on("info", function (data) {
        console.log(data);
        if (data.type == 'client_connected') {
            if (data.clientType == 'remote') {
//                            $scope.statusIcon.showMessage("Remote connected", 2500);
            } else if (data.clientType == 'host') {
                $scope.statusIcon.showMessage("check", "lime", "Host connected", 2500);
            }
        }
        if (data.type == 'client_disconnected') {
            if (data.clientType == 'remote') {
//                            $scope.statusIcon.showMessage("Remote disconnected", 2500);
            } else if (data.clientType == 'host') {
                $scope.statusIcon.showMessage("times", "red", "Host disconnected", 2000, function () {
                    $scope.statusIcon.showMessage("check", "lime");
                });
            }
        }
    });
    socket.on("init", function (data) {
        console.log("init: " + JSON.stringify(data));
        if (data.state == "start") {
            console.info("Initializing Session #" + $scope.session.session)
            $timeout(function () {
                socket.emit("init", {iAm: "remote", session: $scope.session.session});
            }, 500);
        } else if (data.state == "success") {
            console.info("Session initialized.")
            $timeout(function () {
                $scope.session.initialized = true;
                $scope.session.type = data.youAre;
                $scope.statusIcon.showMessage("check", "lime", "Connected", 2500);
            });
        } else if (data.state == "not_found") {
            console.warn("Session not found");
            $timeout(function () {
                $scope.statusIcon.showMessage("times", "red", "Session not found", 20000);
            })
            $timeout(function () {
                window.location = "https://remote-sli.de";
            }, 1500);
        }
    })
    socket.on("control", function (data) {
        if ($scope.settings.vibration)
            window.navigator.vibrate(50);
    })

    $scope.deviceOrientation.sendData = function () {
        if ($scope.deviceOrientation.calibration.active) {
            $scope.deviceOrientation.calibration.onCalibrationStepFinished($scope.deviceOrientation.getVector());
            return;
        }
        console.log(JSON.stringify($scope.deviceOrientation.getVector()))
        socket.emit("deviceOrientation", {v: $scope.deviceOrientation.getVector()})
    };
    $scope.deviceOrientation.calibration.showOrHidePosition = function (action, which) {
        socket.emit("calibrationDot", {action: action, which: which});
    };
    $scope.deviceOrientation.calibration.sendRange = function (yaw, pitch) {
        socket.emit("orientationRange", {yaw: yaw, pitch: pitch})
    };
    window.laserPointer = $scope.deviceOrientation;
    window.addEventListener("deviceorientation", function (event) {
        var absolute = event.absolute;
        var alpha = event.alpha;//  yaw (rotation) | z-axis | [0-360]
        var beta = event.beta;//    pitch          | x-axis | [-180-180]
        var gamma = event.gamma;//  roll           | y-axis | [-90-90]

        if (Math.abs(alpha - $scope.deviceOrientation.lastAlpha) > 0.2 ||
            Math.abs(beta - $scope.deviceOrientation.lastBeta) > 0.2 ||
            Math.abs(gamma - $scope.deviceOrientation.lastGamma) > 0.2) {

            alpha -= 180;

            /*
             // push the original values before modification
             $scope.deviceOrientation.previousOrientations.push([alpha, beta, gamma]);

             // take averages to smooth
             var length = $scope.deviceOrientation.previousOrientations.length;
             if (length > 0) {
             $scope.deviceOrientation.previousOrientations.forEach(function (orientation) {
             alpha += orientation[0];
             beta += orientation[1];
             gamma += orientation[2];
             });
             alpha /= length;
             beta /= length;
             gamma /= length;
             }
             */

            // save the smoothed values
            $scope.deviceOrientation.lastAlpha = alpha;
            $scope.deviceOrientation.lastBeta = beta;
            $scope.deviceOrientation.lastGamma = gamma;

            // remove the oldest orientation
            // TODO: maybe make smoothness level configurable
            if ($scope.deviceOrientation.previousOrientations.length > 4) {
                $scope.deviceOrientation.previousOrientations.shift();
            }


//                        console.log(" ")
//                        console.log("alpha: " + alpha)
//                        console.log(" beta: " + beta)
//                        console.log("gamma: " + gamma)
        }
    }, true);
    var laserDataTimer;
    $("#btn-control-laser").on("mousedown touchstart", function () {
        laserDataTimer = setInterval(function () {
            $scope.deviceOrientation.sendData();
        }, 50);
    }).on("mouseup touchend mouseleave", function () {
        clearInterval(laserDataTimer)
    })

    socket.on("err", function (data) {
        console.warn("err: " + JSON.stringify(data))
    })
}]);