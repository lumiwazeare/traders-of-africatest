"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var DataCache_1 = __importDefault(require("./DataCache"));
var getmethod_1 = __importDefault(require("./getmethod"));
//variables
var port = 3000;
var fetchPhotoFromApi = function (oldResult) { return __awaiter(void 0, void 0, void 0, function () {
    var output, i, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getmethod_1.default("http://jsonplaceholder.typicode.com/photos")];
            case 1:
                output = _a.sent();
                //remove duplicate method O(n). duplicate is determine by the album id
                if (output) {
                    for (i = 0; i < output.length; i++) {
                        //no duplicate was dec
                        if (!oldResult[output[i].albumId]) {
                            oldResult[output[i].albumId] = output[i];
                        }
                    }
                }
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error(err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var dataCache = new DataCache_1.default({}, fetchPhotoFromApi, 1);
//periodically fetch new data from api every 1 minutes;
dataCache.processData();
http.createServer(function (req, res) {
    if (req.method == 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        var data = dataCache.cacheData === null ? [] : dataCache.cacheData;
        res.write(JSON.stringify(handlePagination(data, req)));
        res.end();
    }
    else {
        res.end("Ivalid request");
    }
})
    .listen(port, function () {
    console.log("connected to server on port " + port);
});
function handlePagination(data, req) {
    var parseUrl = new URL(req.url, "http://localhost");
    var currentPage = 1;
    var pageSize = 10;
    var sortBy = 'none';
    if (parseUrl.searchParams) {
        //check the if the page query is change
        var page = parseUrl.searchParams.get('page');
        if (page) {
            var parsePage = parseInt(page);
            if (parsePage && parsePage > 1) {
                currentPage = parsePage;
            }
        }
        //check the if limit query is change
        var limit = parseUrl.searchParams.get('limit');
        if (limit) {
            var parseLimit = parseInt(limit);
            if (parseLimit && parseLimit > 0) {
                pageSize = parseLimit;
            }
        }
        //check the if sortBy query is change, sort can have a value of 'asc' or 'desc'
        var sort = parseUrl.searchParams.get('sortBy');
        if (sort && (sort === 'desc' || sort === 'asc')) {
            sortBy = sort;
        }
    }
    var totalData = data.length;
    var copyData = [];
    var pageCount = Math.round(totalData / pageSize);
    for (var i = 0; i < data.length; i++) {
        copyData.push({
            albumId: data[i].albumId,
            id: data[i].id,
            title: data[i].title,
            url: data[i].url,
            thumbnailUrl: data[i].thumbnailUrl
        });
    }
    //do the sorting here
    if (sortBy !== 'none') {
        copyData.sort(function (a, b) {
            return (sortBy === 'asc' ? a.id - b.id : b.id - a.id);
        });
    }
    var dataArray = [];
    while (copyData.length > 0) {
        dataArray.push(copyData.splice(0, pageSize));
    }
    return {
        data: (dataArray.length > 0 && currentPage <= pageCount) ? dataArray[currentPage - 1] : [],
        totalData: totalData,
        pageSize: dataArray.length > 0 ? pageSize : 0,
        pageCount: pageCount,
        currentPage: currentPage
    };
}
