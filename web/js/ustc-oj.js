// Directed by Li Ding

var app = angular.module("ustc-oj", ['ngRoute', 'ngCookies']);

app.run(function ($rootScope) {
    $rootScope.tabShow = "showProblem";
    //$rootScope.apiHost = "http://106.14.46.189";
    $rootScope.apiHost = "http://ustcoj.applinzi.com";
    $rootScope.loginUrl = "/api/login";
    $rootScope.registerUrl = "/api/login";
    $rootScope.problemListUrl = "/api/problem";
    $rootScope.problemUrl = "/api/problem";
    $rootScope.contestListUrl = "/api/contest";
    $rootScope.problemUrl = "/api/problem";
    $rootScope.contestUrl = "/api/contest";
    $rootScope.submitUrl = "/api/submission"
});

app.service('networkService', function($rootScope, $http, $q, userService, $filter) {

    addDefaultHeader = function(header) {
        header['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8;';
        return header;
    };

    refreshHeader = function (header, url) {
        time = $filter('date')(new Date(), 'yyyyMMddHHmmss');
        userid = userService.getUserid().toString();
        token = userService.getToken();
        header['Time'] = time;
        header['Userid'] = userid;
        tmp = url + time + userid + token;
        console.log(tmp);
        header['Sign'] = window.btoa(tmp);
    };

    this.handleRepData = function(method, url, data, config, extraHeader) {
        var promise;
        var defer = $q.defer();
        if (config == null) {
            config = {}
        }
        switch (method) {
            case 'get':
                header = extraHeader;
                //console.log(header);
                addDefaultHeader(header);
                refreshHeader(header, url);

                realUrl = $rootScope.apiHost + url;
                realConfig = config;
                realConfig.headers = header;
                console.log(realConfig);
                promise = $http.get(realUrl, realConfig);
                break;
            case 'post':
                header = extraHeader;
                dataTosend = $.param(data);
                //console.log(header);
                addDefaultHeader(header);
                refreshHeader(header, url);
                realUrl = $rootScope.apiHost + url;
                realConfig = config;
                realConfig.headers = header;
                console.log(realConfig);
                promise = $http.post(realUrl, dataTosend, realConfig);
                break;
            case 'put':
                promise = $http.put(url, data, config);
                break;
            case 'delete':
                promise = $http.delete(url, config)
        }

        promise.then(function(rep) {
            console.log(rep);
            if (rep.data.status.code === 0) {
                defer.resolve(rep.data);
            } else {
                var errorMsg = rep.data.status.message || 'Unknown error.';
                alert(errorMsg);
                // TODO: redirect to error page
            }
        }, function() {
            defer.reject('HTTP request failed. Please try again.');
        });

        return defer.promise;
    };

});

app.service('problemService', function($rootScope, $sce, userService, networkService) {

    this.getProblemData = function(show_problemData, problemId, contestId="none") {

        networkService.handleRepData('get', $rootScope.problemUrl + '/' + problemId, null, null, {})
            .then(function (response) {
                console.log(response);
                show_problemData(resolveProblemData(response.data));
            });

    };

    languageList = ["C", "C++"];
    resultList = ["Accepted", ]

    resolveProblemData = function (data) {
        /*
        data.problem.description =
            $sce.trustAsHtml(data.problem.description);
        data.problem.input =
            $sce.trustAsHtml(data.problem.input_description);
        data.problem.output =
            $sce.trustAsHtml(data.problem.output_description);
        data.problem.hint =
            $sce.trustAsHtml(data.problem.hint);
        */
        //str = str.replace(/(?:\r\n|\r|\n)/g, '<br />');
        var len = data.problem.input_sample.length;
        for (i = 0; i < len; i++) {
            data.problem.input_sample[i] = $sce.trustAsHtml(data.problem.input_sample[i].replace(/(?:\r\n|\r|\n)/g, '<br />'));
            data.problem.output_sample[i] = $sce.trustAsHtml(data.problem.output_sample[i].replace(/(?:\r\n|\r|\n)/g, '<br />'));
        }
        return data;

    };

    this.getProblemList = function(show_problemList, _page, _per_page) {

        param = {
            page: _page,
            per_page: _per_page
        };
        networkService.handleRepData('get', $rootScope.problemListUrl, null, {params: param}, {})
            .then(function (response) {
                console.log(response);
                show_problemList(response.data);
            });

    };

    this.getContestList = function(show_contestList, _page, _per_page) {

        param = {
            page: _page,
            per_page: _per_page
        };
        networkService.handleRepData('get', $rootScope.contestListUrl, null, {params: param}, {})
            .then(function (response) {
                console.log(response);
                show_contestList(response.data);
            });

    };

    this.getContestInfo = function(show_contestInfo, _contestid) {

        networkService.handleRepData('get', $rootScope.contestListUrl + '/' + _contestid, null, null, {
            Contestid: _contestid
        })
        .then(function (response) {
            console.log(response);
            show_contestInfo(response.data);
        });

    };

    this.submitCode = function(submit_complete, _submission_data, _contestid) {

        networkService.handleRepData('post', $rootScope.submitUrl, _submission_data, {}, {
            Contestid: _contestid
        })
        .then(function (response) {
            console.log(response);
            submit_complete(response.data);
        });

    };

});

app.service('userService', function($rootScope, $cookies, $http, $window) {

    var tempConfig = {
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    };

    this.login = function (username, password) {

        var data = {
            password: MD5(password),
            username: username
        };
        console.log(data);

        response = $http.post($rootScope.apiHost + $rootScope.loginUrl, $.param(data), tempConfig)
            .then(function (response) {
                if (response.data.status.code === 0) {
                    $cookies.put("userId", response.data.data.user.user_id);
                    $cookies.put("token", response.data.data.token);
                    $cookies.put("username", response.data.data.user.username);
                    $window.location.href = '#/problems';
                }
                else {
                    alert(response.data.status.message);
                }
        });

    };

    this.register = function (username, password) {

        var data = {
            password: MD5(password),
            username: username
        };

        //response = networkService.post($rootScope.registerUrl, data);
        response = $http.post($rootScope.registerUrl, $.param(data), tempConfig)
            .then(function (response) {
                $cookies.put("userId", response.data.user_id);
            });
    };

    this.getToken = function () {
        console.log($cookies.get("token"));
        return $cookies.get("token");
    };

    this.getUserid = function() {
        tmpId = $cookies.get("userId");
        if (tmpId) {
            return tmpId;
        }
        else {
            return -1;
        }
    };

    var MD5 = function (s) {
        function L(k, d) {
            return (k << d) | (k >>> (32 - d))
        }

        function K(G, k) {
            var I, d, F, H, x;
            F = (G & 2147483648);
            H = (k & 2147483648);
            I = (G & 1073741824);
            d = (k & 1073741824);
            x = (G & 1073741823) + (k & 1073741823);
            if (I & d) {
                return (x ^ 2147483648 ^ F ^ H)
            }
            if (I | d) {
                if (x & 1073741824) {
                    return (x ^ 3221225472 ^ F ^ H)
                } else {
                    return (x ^ 1073741824 ^ F ^ H)
                }
            } else {
                return (x ^ F ^ H)
            }
        }

        function r(d, F, k) {
            return (d & F) | ((~d) & k)
        }

        function q(d, F, k) {
            return (d & k) | (F & (~k))
        }

        function p(d, F, k) {
            return (d ^ F ^ k)
        }

        function n(d, F, k) {
            return (F ^ (d | (~k)))
        }

        function u(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(r(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function f(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(q(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function D(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(p(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function t(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(n(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function e(G) {
            var Z;
            var F = G.length;
            var x = F + 8;
            var k = (x - (x % 64)) / 64;
            var I = (k + 1) * 16;
            var aa = Array(I - 1);
            var d = 0;
            var H = 0;
            while (H < F) {
                Z = (H - (H % 4)) / 4;
                d = (H % 4) * 8;
                aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
                H++
            }
            Z = (H - (H % 4)) / 4;
            d = (H % 4) * 8;
            aa[Z] = aa[Z] | (128 << d);
            aa[I - 2] = F << 3;
            aa[I - 1] = F >>> 29;
            return aa
        }

        function B(x) {
            var k = "", F = "", G, d;
            for (d = 0; d <= 3; d++) {
                G = (x >>> (d * 8)) & 255;
                F = "0" + G.toString(16);
                k = k + F.substr(F.length - 2, 2)
            }
            return k
        }

        function J(k) {
            k = k.replace(/rn/g, "n");
            var d = "";
            for (var F = 0; F < k.length; F++) {
                var x = k.charCodeAt(F);
                if (x < 128) {
                    d += String.fromCharCode(x)
                } else {
                    if ((x > 127) && (x < 2048)) {
                        d += String.fromCharCode((x >> 6) | 192);
                        d += String.fromCharCode((x & 63) | 128)
                    } else {
                        d += String.fromCharCode((x >> 12) | 224);
                        d += String.fromCharCode(((x >> 6) & 63) | 128);
                        d += String.fromCharCode((x & 63) | 128)
                    }
                }
            }
            return d
        }

        var C = Array();
        var P, h, E, v, g, Y, X, W, V;
        var S = 7, Q = 12, N = 17, M = 22;
        var A = 5, z = 9, y = 14, w = 20;
        var o = 4, m = 11, l = 16, j = 23;
        var U = 6, T = 10, R = 15, O = 21;
        s = J(s);
        C = e(s);
        Y = 1732584193;
        X = 4023233417;
        W = 2562383102;
        V = 271733878;
        for (P = 0; P < C.length; P += 16) {
            h = Y;
            E = X;
            v = W;
            g = V;
            Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
            V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
            W = u(W, V, Y, X, C[P + 2], N, 606105819);
            X = u(X, W, V, Y, C[P + 3], M, 3250441966);
            Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
            V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
            W = u(W, V, Y, X, C[P + 6], N, 2821735955);
            X = u(X, W, V, Y, C[P + 7], M, 4249261313);
            Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
            V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
            W = u(W, V, Y, X, C[P + 10], N, 4294925233);
            X = u(X, W, V, Y, C[P + 11], M, 2304563134);
            Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
            V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
            W = u(W, V, Y, X, C[P + 14], N, 2792965006);
            X = u(X, W, V, Y, C[P + 15], M, 1236535329);
            Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
            V = f(V, Y, X, W, C[P + 6], z, 3225465664);
            W = f(W, V, Y, X, C[P + 11], y, 643717713);
            X = f(X, W, V, Y, C[P + 0], w, 3921069994);
            Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
            V = f(V, Y, X, W, C[P + 10], z, 38016083);
            W = f(W, V, Y, X, C[P + 15], y, 3634488961);
            X = f(X, W, V, Y, C[P + 4], w, 3889429448);
            Y = f(Y, X, W, V, C[P + 9], A, 568446438);
            V = f(V, Y, X, W, C[P + 14], z, 3275163606);
            W = f(W, V, Y, X, C[P + 3], y, 4107603335);
            X = f(X, W, V, Y, C[P + 8], w, 1163531501);
            Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
            V = f(V, Y, X, W, C[P + 2], z, 4243563512);
            W = f(W, V, Y, X, C[P + 7], y, 1735328473);
            X = f(X, W, V, Y, C[P + 12], w, 2368359562);
            Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
            V = D(V, Y, X, W, C[P + 8], m, 2272392833);
            W = D(W, V, Y, X, C[P + 11], l, 1839030562);
            X = D(X, W, V, Y, C[P + 14], j, 4259657740);
            Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
            V = D(V, Y, X, W, C[P + 4], m, 1272893353);
            W = D(W, V, Y, X, C[P + 7], l, 4139469664);
            X = D(X, W, V, Y, C[P + 10], j, 3200236656);
            Y = D(Y, X, W, V, C[P + 13], o, 681279174);
            V = D(V, Y, X, W, C[P + 0], m, 3936430074);
            W = D(W, V, Y, X, C[P + 3], l, 3572445317);
            X = D(X, W, V, Y, C[P + 6], j, 76029189);
            Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
            V = D(V, Y, X, W, C[P + 12], m, 3873151461);
            W = D(W, V, Y, X, C[P + 15], l, 530742520);
            X = D(X, W, V, Y, C[P + 2], j, 3299628645);
            Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
            V = t(V, Y, X, W, C[P + 7], T, 1126891415);
            W = t(W, V, Y, X, C[P + 14], R, 2878612391);
            X = t(X, W, V, Y, C[P + 5], O, 4237533241);
            Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
            V = t(V, Y, X, W, C[P + 3], T, 2399980690);
            W = t(W, V, Y, X, C[P + 10], R, 4293915773);
            X = t(X, W, V, Y, C[P + 1], O, 2240044497);
            Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
            V = t(V, Y, X, W, C[P + 15], T, 4264355552);
            W = t(W, V, Y, X, C[P + 6], R, 2734768916);
            X = t(X, W, V, Y, C[P + 13], O, 1309151649);
            Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
            V = t(V, Y, X, W, C[P + 11], T, 3174756917);
            W = t(W, V, Y, X, C[P + 2], R, 718787259);
            X = t(X, W, V, Y, C[P + 9], O, 3951481745);
            Y = K(Y, h);
            X = K(X, E);
            W = K(W, v);
            V = K(V, g)
        }
        var i = B(Y) + B(X) + B(W) + B(V);
        return i.toLowerCase()
    };


});

app.directive('onFinishRenderFilters', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
});

