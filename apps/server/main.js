/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_module_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(12);
const app_service_1 = __webpack_require__(13);
const mongoose_1 = __webpack_require__(14);
const product_module_1 = __webpack_require__(15);
const core_1 = __webpack_require__(2);
const global_interceptor_1 = __webpack_require__(28);
const user_module_1 = __webpack_require__(30);
const auth_module_1 = __webpack_require__(37);
const config_1 = __webpack_require__(41);
const configuration_1 = __webpack_require__(42);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                load: [configuration_1.configuration],
                envFilePath: `.env`
            }),
            common_module_1.CommonModule,
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('DBURI'),
                }),
                inject: [config_1.ConfigService],
            }),
            product_module_1.ProductModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: global_interceptor_1.GlobalInterceptor,
            },
        ],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
https://docs.nestjs.com/modules
*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const common_service_1 = __webpack_require__(6);
const storage_service_1 = __webpack_require__(7);
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        controllers: [],
        providers: [common_service_1.CommonService, storage_service_1.StorageService],
        exports: [common_service_1.CommonService, storage_service_1.StorageService]
    })
], CommonModule);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
https://docs.nestjs.com/providers#services
*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let CommonService = class CommonService {
    createSuccessResponse(data, message = '') {
        return {
            status_name: 'success',
            status_code: 1,
            data: data,
            message: message
        };
    }
    createFailureResponse(data, message = '') {
        return {
            status_name: 'failure',
            status_code: 0,
            data: data,
            message: message
        };
    }
    createFilterCondition(filters = [], columns = [], allConditionClum = []) {
        let formattedCondition = {};
        console.log("filters", filters);
        if (filters.length == undefined) {
            filters = [];
        }
        if (filters.columns == undefined) {
            columns = [];
        }
        if (filters.length > 0) {
            formattedCondition = { '$and': [] };
        }
        if (columns.length == 0) {
            columns = filters;
        }
        filters.forEach(filter => {
            let filter_column = filter.column;
            let filterColumn = columns.filter(column => column.prop == filter.column)[0];
            //For default filters filterColumn will be empty as if there wont be any columns for that 
            //Type cast values if need to be .
            if (filterColumn != undefined && filterColumn['filterTypeCast'] != undefined) {
                filter.value = this.typeCast(filterColumn['filterTypeCast'], filter.value);
                // Check for custom filter column name if it is available use it
                if (typeof filterColumn['filterField'] !== 'undefined') {
                    filter_column = filterColumn['filterField'];
                }
            }
            if (filter_column == '~m~all') {
                const allC = [];
                console.log("allConditionClum", allConditionClum);
                if (allConditionClum.length > 0) {
                    allConditionClum.forEach(element => {
                        allC.push({ [element]: { $regex: '.*' + filter.value } });
                    });
                    const orC = { '$or': allC };
                    formattedCondition['$and'].push(orC);
                }
            }
            else {
                let filterType = (typeof (filter.type) == 'object') ? filter.type.condition : filter.type;
                switch (filterType) {
                    case 'in':
                        if (!Array.isArray(filter.value)) {
                            filter.value = [filter.value];
                        }
                        formattedCondition['$and'].push({ [filter_column]: { '$in': filter.value } });
                        break;
                    case 'nin':
                        if (!Array.isArray(filter.value)) {
                            filter.value = [filter.value];
                        }
                        formattedCondition['$and'].push({ [filter_column]: { $nin: filter.value } });
                        break;
                    case 'contains':
                        formattedCondition['$and'].push({
                            [filter_column]: {
                                $regex: '.*' + filter.value,
                                $options: 'i',
                            }
                        });
                        break;
                    case 'gte':
                        formattedCondition['$and'].push({ [filter_column]: { $gte: filter.value } });
                        break;
                    case 'gt':
                        formattedCondition['$and'].push({ [filter_column]: { $gt: filter.value } });
                        break;
                    case 'lte':
                        filter.value = filterColumn.dataType == 'date' ? new Date(filter.value) : filter.value;
                        formattedCondition['$and'].push({ [filter_column]: { $lte: filter.value } });
                        break;
                    case 'lt':
                        filter.value = filterColumn.dataType == 'date' ? new Date(filter.value) : filter.value;
                        formattedCondition['$and'].push({ [filter_column]: { $lt: filter.value } });
                        break;
                    case 'eq':
                        formattedCondition['$and'].push({ [filter_column]: { $eq: filter.value } });
                        break;
                    case 'ne':
                        formattedCondition['$and'].push({ [filter_column]: { $ne: filter.value } });
                        break;
                    case 'between':
                        formattedCondition['$and'].push({
                            '$and': [
                                { [filter_column]: { $gte: new Date(filter.value.startDate) } },
                                { [filter_column]: { $lt: new Date(filter.value.endDate) } }
                            ]
                        });
                        break;
                    case 'exists':
                        formattedCondition['$and'].push({ [filter_column]: { $exists: filter.value } });
                        break;
                    case 'daterange':
                        formattedCondition['$and'].push({
                            '$and': [
                                { [filter_column]: { $gte: new Date(filter.value['dateRange']['beginJsDate']) } },
                                { [filter_column]: { $lte: new Date(filter.value['dateRange']['endJsDate']) } }
                            ]
                        });
                        break;
                    default:
                        formattedCondition['$and'].push({ [filter_column]: filter.value });
                }
            }
        });
        console.log("formattedCondition", JSON.stringify(formattedCondition));
        return formattedCondition;
    }
    createSortBy(sortBy = []) {
        // eslint-disable-next-line prefer-const
        let formattedSortBy = {};
        if (sortBy.length == undefined) {
            formattedSortBy = sortBy;
        }
        else {
            sortBy.forEach(sort => {
                const sortColumn = sort.prop;
                const sortOrder = sort.dir == 'asc' ? 1 : -1;
                formattedSortBy[sortColumn] = sortOrder;
            });
        }
        ;
        return formattedSortBy;
    }
    typeCast(type, value) {
        let values;
        if (type === 'mongoObject') {
            if (Array.isArray(value) === true) {
                values = [];
                value.forEach(element => {
                    // values.push(mongoose.mongo.BSONType.objectId(element));
                });
            }
            else {
                // values = mongoose.Types.ObjectId(value)
            }
            return values;
        }
    }
};
exports.CommonService = CommonService;
exports.CommonService = CommonService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CommonService);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.readfile = exports.mkDir = exports.fileFilter = exports.storageConfig = exports.StorageService = void 0;
const tslib_1 = __webpack_require__(4);
const fs_1 = __webpack_require__(8);
const multer_1 = __webpack_require__(9);
const path_1 = __webpack_require__(10);
const mimeType = tslib_1.__importStar(__webpack_require__(11));
const fs_2 = __webpack_require__(8);
class StorageService {
    constructor() { }
    moveFile(source, destination, filename) {
        return new Promise((resolve, reject) => {
            let currentPath = './uploads/';
            if (destination.length > 0) {
                destination.forEach(element => {
                    currentPath = currentPath + '/' + element;
                    if (!(0, fs_1.existsSync)(currentPath)) {
                        (0, fs_1.mkdirSync)(currentPath);
                    }
                });
            }
            const destinationPath = currentPath + filename;
            (0, fs_2.rename)(source, destinationPath, (err) => {
                if (err) {
                    reject({ status: 0, data: err });
                }
                resolve({ status: 1, data: destinationPath });
            });
        });
    }
}
exports.StorageService = StorageService;
function storageConfig(fileName, folder = [], options = {
    maxFiles: 1, maxFileSize: 2, allowedMimeTypes: ['image/jpeg', 'image/png']
}) {
    let currentPath = './uploads/';
    (0, exports.mkDir)(currentPath);
    if (folder.length > 0) {
        folder.forEach(element => {
            currentPath = currentPath + '/' + element;
            (0, exports.mkDir)(currentPath);
        });
    }
    return {
        storage: (0, multer_1.diskStorage)({
            destination: currentPath,
            filename: (req, file, callback) => {
                callback(null, generateFileName(file));
            }
        }),
        fileFilter: (req, file, callback) => {
            return callback(null, checkMimeTypes(file.mimetype, options.allowedMimeTypes));
        },
        limits: {
            files: options.maxFiles,
            // fileSize: options.maxFileSize in MB
            fileSize: options.maxFileSize * 1024 * 1024
        }
    };
}
exports.storageConfig = storageConfig;
;
function generateFileName(file) {
    return `${Date.now()}_${(0, path_1.extname)(file.originalname)}`;
}
function checkMimeTypes(fileMimeType, allowedMimeTypes) {
    let result = false;
    const tempLookup = ['text/xml'].concat(allowedMimeTypes);
    allowedMimeTypes.forEach(element => {
        if (mimeType.lookup(element) === fileMimeType || tempLookup.includes(fileMimeType)) {
            console.log('file is allowed', element, fileMimeType);
            result = true;
        }
        else {
            console.log('file is not allowed', fileMimeType);
        }
    });
    return result;
}
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
exports.fileFilter = fileFilter;
const mkDir = (path) => {
    if (!(0, fs_1.existsSync)(path)) {
        (0, fs_1.mkdirSync)(path);
    }
};
exports.mkDir = mkDir;
const readfile = async (path, type = 'utf8') => {
    return new Promise((resolve, reject) => {
        (0, fs_1.readFile)(path, type, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
exports.readfile = readfile;


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("multer");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("mime-types");

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(13);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductModule = void 0;
const tslib_1 = __webpack_require__(4);
const product_service_1 = __webpack_require__(16);
const product_controller_1 = __webpack_require__(18);
/*
https://docs.nestjs.com/modules
*/
const common_1 = __webpack_require__(1);
const mongoose_1 = __webpack_require__(14);
const product_schema_1 = __webpack_require__(23);
const product_group_schema_1 = __webpack_require__(24);
const product_group_controller_1 = __webpack_require__(25);
const product_group_service_1 = __webpack_require__(26);
let ProductModule = class ProductModule {
};
exports.ProductModule = ProductModule;
exports.ProductModule = ProductModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: product_group_schema_1.ProductGroup.name, schema: product_group_schema_1.ProductGroupSchema }]),
        ],
        controllers: [
            product_controller_1.ProductController,
            product_group_controller_1.ProductGroupController
        ],
        providers: [
            product_service_1.ProductService,
            product_group_service_1.ProductGroupService
        ],
    })
], ProductModule);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
https://docs.nestjs.com/providers#services
*/
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const mongoose_1 = __webpack_require__(14);
const mongoose_2 = __webpack_require__(17);
let ProductService = class ProductService {
    constructor(productModel) {
        this.productModel = productModel;
    }
    async create(data) {
        const model = new this.productModel(data);
        return model.save();
    }
    async findCount(condition = {}) {
        return await this.productModel.find(condition).countDocuments().exec();
    }
    async findOne(id) {
        return await this.productModel.findOne({ _id: id }).exec();
    }
    async updateById(id, data) {
        const result = await this.productModel.updateOne({ _id: id }, data).exec();
        return { matched: result.matchedCount, modified: result.modifiedCount };
    }
    async delete(id) {
        const result = await this.productModel.updateOne({ _id: id }, { status: -1 });
        return { matched: result.matchedCount, modified: result.modifiedCount };
    }
    async findAll(condition = {}, columns = {}, sort = {}, page = { pageSize: 1000, offset: 0 }) {
        const offset = (page.offset + 1) * page.pageSize - page.pageSize;
        return await this.productModel.find(condition, columns, {
            sort: [{ updatedAt: -1 }],
            skip: offset,
            limit: page.pageSize,
        }).exec();
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, mongoose_1.InjectModel)('Product')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], ProductService);


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
https://docs.nestjs.com/controllers#controllers
*/
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const platform_express_1 = __webpack_require__(19);
const product_service_1 = __webpack_require__(16);
const storage_service_1 = __webpack_require__(7);
const express_1 = __webpack_require__(20);
const fs = tslib_1.__importStar(__webpack_require__(8));
const jwt_auth_guard_1 = __webpack_require__(21);
let ProductController = class ProductController {
    constructor(productService) {
        this.productService = productService;
    }
    async upload(file) {
        return file;
    }
    async create(body) {
        return await this.productService.create(body);
    }
    async getProductById(id) {
        return await this.productService.findOne(id);
    }
    async updateProductById(id, updateData) {
        return await this.productService.updateById(id, updateData['data']);
    }
    async deleteProductById(id) {
        const { modified } = await this.productService.delete(id);
        return { deleted: modified };
    }
    async serveFile(res, name) {
        if (fs.existsSync(process.env.API_UPLOADS + '/' + name)) {
            const fileStream = fs.createReadStream(process.env.API_UPLOADS + '/' + name);
            fileStream.pipe(res);
        }
    }
    async getProductList(filters, sort = [{ field: 'created_at', order: -1 }], columns = [], offset = 0, pageSize = 25) {
        const customizations = await this.productService.findAll(filters, columns, sort, { pageSize, offset });
        const recordCount = await this.productService.findCount(filters);
        return { data: customizations, count: recordCount };
    }
};
exports.ProductController = ProductController;
tslib_1.__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, storage_service_1.storageConfig)(''))),
    tslib_1.__param(0, (0, common_1.UploadedFile)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "upload", null);
tslib_1.__decorate([
    (0, common_1.Post)('create'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)('view/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "getProductById", null);
tslib_1.__decorate([
    (0, common_1.Patch)('update/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "updateProductById", null);
tslib_1.__decorate([
    (0, common_1.Delete)('delete/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], ProductController.prototype, "deleteProductById", null);
tslib_1.__decorate([
    (0, common_1.Get)('image/:name'),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__param(1, (0, common_1.Param)('name')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ProductController.prototype, "serveFile", null);
tslib_1.__decorate([
    (0, common_1.Get)('list?'),
    tslib_1.__param(0, (0, common_1.Query)('filters')),
    tslib_1.__param(1, (0, common_1.Query)('sort')),
    tslib_1.__param(2, (0, common_1.Query)('columns')),
    tslib_1.__param(3, (0, common_1.Query)('page')),
    tslib_1.__param(4, (0, common_1.Query)('pageSize')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Array, Array, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "getProductList", null);
exports.ProductController = ProductController = tslib_1.__decorate([
    (0, common_1.Controller)('product'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof product_service_1.ProductService !== "undefined" && product_service_1.ProductService) === "function" ? _a : Object])
], ProductController);


/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(22);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    // constructor(private authService: AuthService) {
    //     super();
    // }
    // canActivate(context: ExecutionContext) {
    //     // Add your custom authentication logic here
    //     // for example, call super.logIn(request) to establish a session.
    //     console.log(context.switchToHttp().getRequest());
    //     return true;
    //     // return this.authService.isTokenValid();
    // }
    // handleRequest(err, user, info) {
    //     // You can throw an exception based on either "info" or "err" arguments
    //     if (err || !user) {
    //         throw err || new UnauthorizedException();
    //     }
    //     return user;
    // }
    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();
        request.user = user;
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateProductDto = exports.ProductSchema = exports.Product = void 0;
const tslib_1 = __webpack_require__(4);
const mongoose_1 = __webpack_require__(14);
let Product = class Product {
};
exports.Product = Product;
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "name", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", Number)
], Product.prototype, "price", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)((0, mongoose_1.raw)({ filename: { type: String }, mimetype: { type: String }, originalname: { type: String }, path: { type: String }, size: { type: Number } })),
    tslib_1.__metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], Product.prototype, "image", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", Array)
], Product.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "desc", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", Number)
], Product.prototype, "stock", void 0);
exports.Product = Product = tslib_1.__decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Product);
exports.ProductSchema = mongoose_1.SchemaFactory.createForClass(Product);
class CreateProductDto {
}
exports.CreateProductDto = CreateProductDto;


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateProductGroupDto = exports.ProductGroupSchema = exports.ProductGroup = void 0;
const tslib_1 = __webpack_require__(4);
const mongoose_1 = __webpack_require__(14);
let ProductGroup = class ProductGroup {
};
exports.ProductGroup = ProductGroup;
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", String)
], ProductGroup.prototype, "name", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", Number)
], ProductGroup.prototype, "price", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)((0, mongoose_1.raw)({ filename: { type: String }, mimetype: { type: String }, originalname: { type: String }, path: { type: String }, size: { type: Number } })),
    tslib_1.__metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], ProductGroup.prototype, "image", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", Array)
], ProductGroup.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", Array)
], ProductGroup.prototype, "products", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", String)
], ProductGroup.prototype, "desc", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    tslib_1.__metadata("design:type", Number)
], ProductGroup.prototype, "status", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({}),
    tslib_1.__metadata("design:type", Number)
], ProductGroup.prototype, "finished", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({}),
    tslib_1.__metadata("design:type", Number)
], ProductGroup.prototype, "semi", void 0);
exports.ProductGroup = ProductGroup = tslib_1.__decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProductGroup);
exports.ProductGroupSchema = mongoose_1.SchemaFactory.createForClass(ProductGroup);
class CreateProductGroupDto {
}
exports.CreateProductGroupDto = CreateProductGroupDto;


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
https://docs.nestjs.com/controllers#controllers
*/
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductGroupController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const product_group_service_1 = __webpack_require__(26);
const storage_service_1 = __webpack_require__(7);
const platform_express_1 = __webpack_require__(19);
const express_1 = __webpack_require__(20);
const fs = tslib_1.__importStar(__webpack_require__(8));
const commonTypes_schema_1 = __webpack_require__(27);
const jwt_auth_guard_1 = __webpack_require__(21);
let ProductGroupController = class ProductGroupController {
    constructor(productGroupService) {
        this.productGroupService = productGroupService;
    }
    async upload(file) {
        return file;
    }
    async create(body) {
        return await this.productGroupService.create(body);
    }
    async getProductById(id) {
        return await this.productGroupService.findOne(id);
    }
    async updateProductById(id, updateData) {
        return await this.productGroupService.updateById(id, updateData['data']);
    }
    async deleteProductById(id) {
        const { modified } = await this.productGroupService.delete(id);
        return { deleted: modified };
    }
    async serveFile(res, name) {
        const fileStream = fs.createReadStream(process.env.API_UPLOADS + '/' + name);
        fileStream.pipe(res);
    }
    async getProductList(filters, sort = [{ field: 'created_at', order: -1 }], columns, offset = 0, pageSize = 25, req) {
        console.log('req', req.user);
        const customizations = await this.productGroupService.findAll(filters, columns, sort, { pageSize, offset });
        const recordCount = await this.productGroupService.findCount(filters);
        return { data: customizations, count: recordCount };
    }
};
exports.ProductGroupController = ProductGroupController;
tslib_1.__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, storage_service_1.storageConfig)(''))),
    tslib_1.__param(0, (0, common_1.UploadedFile)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductGroupController.prototype, "upload", null);
tslib_1.__decorate([
    (0, common_1.Post)('create'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductGroupController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)('view/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductGroupController.prototype, "getProductById", null);
tslib_1.__decorate([
    (0, common_1.Patch)('update/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductGroupController.prototype, "updateProductById", null);
tslib_1.__decorate([
    (0, common_1.Delete)('delete/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], ProductGroupController.prototype, "deleteProductById", null);
tslib_1.__decorate([
    (0, common_1.Get)('image/:name'),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__param(1, (0, common_1.Param)('name')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ProductGroupController.prototype, "serveFile", null);
tslib_1.__decorate([
    (0, common_1.Get)('list?'),
    tslib_1.__param(0, (0, common_1.Query)('filters')),
    tslib_1.__param(1, (0, common_1.Query)('sort')),
    tslib_1.__param(2, (0, common_1.Query)('columns')),
    tslib_1.__param(3, (0, common_1.Query)('page')),
    tslib_1.__param(4, (0, common_1.Query)('pageSize')),
    tslib_1.__param(5, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Array, typeof (_e = typeof commonTypes_schema_1.DisplayColumn !== "undefined" && commonTypes_schema_1.DisplayColumn) === "function" ? _e : Object, Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductGroupController.prototype, "getProductList", null);
exports.ProductGroupController = ProductGroupController = tslib_1.__decorate([
    (0, common_1.Controller)('product_group'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof product_group_service_1.ProductGroupService !== "undefined" && product_group_service_1.ProductGroupService) === "function" ? _a : Object])
], ProductGroupController);


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
https://docs.nestjs.com/providers#services
*/
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductGroupService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const mongoose_1 = __webpack_require__(14);
const mongoose_2 = __webpack_require__(17);
let ProductGroupService = class ProductGroupService {
    constructor(productGroupModel) {
        this.productGroupModel = productGroupModel;
    }
    async create(data) {
        const model = new this.productGroupModel(data);
        return model.save();
    }
    async findCount(condition = {}) {
        return await this.productGroupModel.find(condition).countDocuments().exec();
    }
    async findOne(id) {
        return await this.productGroupModel.findOne({ _id: id }).exec();
    }
    async updateById(id, data) {
        const result = await this.productGroupModel.updateOne({ _id: id }, data).exec();
        return { matched: result.matchedCount, modified: result.modifiedCount };
    }
    async delete(id) {
        const result = await this.productGroupModel.updateOne({ _id: id }, { status: -1 });
        return { matched: result.matchedCount, modified: result.modifiedCount };
    }
    async findAll(condition = {}, columns = {}, sort = {}, page = { pageSize: 1000, offset: 0 }) {
        const offset = (page.offset + 1) * page.pageSize - page.pageSize;
        return await this.productGroupModel.find(condition, columns, {
            sort: [{ updatedAt: -1 }],
            skip: offset,
            limit: page.pageSize,
        }).exec();
    }
};
exports.ProductGroupService = ProductGroupService;
exports.ProductGroupService = ProductGroupService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, mongoose_1.InjectModel)('ProductGroup')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], ProductGroupService);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RecordStatus = exports.Sort = exports.Pagination = exports.Filter = void 0;
class Filter {
}
exports.Filter = Filter;
class Pagination {
}
exports.Pagination = Pagination;
class Sort {
}
exports.Sort = Sort;
var RecordStatus;
(function (RecordStatus) {
    RecordStatus[RecordStatus["ACTIVE"] = 1] = "ACTIVE";
    RecordStatus[RecordStatus["INACTIVE"] = 0] = "INACTIVE";
    RecordStatus[RecordStatus["DELETED"] = -1] = "DELETED";
})(RecordStatus || (exports.RecordStatus = RecordStatus = {}));


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
https://docs.nestjs.com/interceptors#interceptors
*/
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GlobalInterceptor = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const operators_1 = __webpack_require__(29);
const common_service_1 = __webpack_require__(6);
let GlobalInterceptor = class GlobalInterceptor {
    constructor(commonService) {
        this.commonService = commonService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        Object.keys(request.query).forEach(e => {
            if (typeof request.query[e] == 'string' && request.query[e].match(/[[{]/)) {
                request.query[e] = JSON.parse(request.query[e]);
            }
            switch (e) {
                case 'filters':
                    request.query[e] = this.commonService.createFilterCondition(request.query[e]);
                    break;
                default:
                    break;
            }
        });
        return next
            .handle()
            .pipe(
        // tap(() => console.log(`After...`)),
        (0, operators_1.map)(data => this.commonService.createSuccessResponse(data)));
    }
};
exports.GlobalInterceptor = GlobalInterceptor;
exports.GlobalInterceptor = GlobalInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof common_service_1.CommonService !== "undefined" && common_service_1.CommonService) === "function" ? _a : Object])
], GlobalInterceptor);


/***/ }),
/* 29 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const mongoose_1 = __webpack_require__(14);
const user_service_1 = __webpack_require__(31);
const user_controller_1 = __webpack_require__(33);
const user_schema_1 = __webpack_require__(36);
const auth_module_1 = __webpack_require__(37);
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
        ],
        controllers: [
            user_controller_1.UserController
        ],
        providers: [
            user_service_1.UserService
        ],
        exports: [user_service_1.UserService]
    })
], UserModule);


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const mongoose_1 = __webpack_require__(14);
const mongoose_2 = __webpack_require__(17);
const bcrypt = tslib_1.__importStar(__webpack_require__(32));
let UserService = class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async createHash(password) {
        const saltOrRounds = 10;
        return await bcrypt.hash(password, saltOrRounds);
    }
    async compareHash(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    async create(userDto) {
        userDto.password = await this.createHash(userDto.password);
        const model = new this.userModel(userDto);
        return model.save();
    }
    findOne(id, columns = {}) {
        return this.userModel.findOne({ _id: id }, columns).exec();
    }
    // FindOne With Condition
    findOneWC(condition) {
        return this.userModel.findOne(condition).exec();
    }
    async findCount(condition = {}) {
        return await this.userModel.find(condition).countDocuments().exec();
    }
    async updateById(id, data) {
        const result = await this.userModel.updateOne({ _id: id }, data).exec();
        return { matched: result.matchedCount, modified: result.modifiedCount };
    }
    async delete(id) {
        const result = await this.userModel.updateOne({ _id: id }, { status: -1 });
        return { matched: result.matchedCount, modified: result.modifiedCount };
    }
    async findAll(condition = {}, columns = {}, sort = {}, page = { pageSize: 1000, offset: 0 }) {
        const offset = (page.offset + 1) * page.pageSize - page.pageSize;
        return await this.userModel.find(condition, columns, {
            sort: [{ updatedAt: -1 }],
            skip: offset,
            limit: page.pageSize,
        }).exec();
    }
};
exports.UserService = UserService;
exports.UserService = UserService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, mongoose_1.InjectModel)('User')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], UserService);


/***/ }),
/* 32 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(34);
const jwt_auth_guard_1 = __webpack_require__(21);
const user_service_1 = __webpack_require__(31);
let UserController = class UserController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    login(username, password) {
        return this.authService.login({ username, password });
    }
    async create(body) {
        return await this.userService.create(body);
    }
    async getProductById(id) {
        return await this.userService.findOne(id);
    }
    async updateProductById(id, updateData) {
        return await this.userService.updateById(id, updateData['data']);
    }
    async deleteProductById(id) {
        const { modified } = await this.userService.delete(id);
        return { deleted: modified };
    }
    async getProductList(filters, sort = [{ field: 'created_at', order: -1 }], columns = [], offset = 0, pageSize = 25) {
        const customizations = await this.userService.findAll(filters, columns, sort, { pageSize, offset });
        const recordCount = await this.userService.findCount(filters);
        return { data: customizations, count: recordCount };
    }
};
exports.UserController = UserController;
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Body)('username')),
    tslib_1.__param(1, (0, common_1.Body)('password')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", void 0)
], UserController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('create'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)('view/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "getProductById", null);
tslib_1.__decorate([
    (0, common_1.Patch)('update/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "updateProductById", null);
tslib_1.__decorate([
    (0, common_1.Delete)('delete/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UserController.prototype, "deleteProductById", null);
tslib_1.__decorate([
    (0, common_1.Get)('list?'),
    tslib_1.__param(0, (0, common_1.Query)('filters')),
    tslib_1.__param(1, (0, common_1.Query)('sort')),
    tslib_1.__param(2, (0, common_1.Query)('columns')),
    tslib_1.__param(3, (0, common_1.Query)('page')),
    tslib_1.__param(4, (0, common_1.Query)('pageSize')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Array, Array, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserController.prototype, "getProductList", null);
exports.UserController = UserController = tslib_1.__decorate([
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _b : Object])
], UserController);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(35);
const user_service_1 = __webpack_require__(31);
let AuthService = class AuthService {
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async login({ username, password }) {
        const user = await this.validateUser({ username, password });
        const payload = { username: user.username, _id: user._id, role: user.role };
        if (!user) {
            throw new Error("Invalid User Credentials!!!");
        }
        return {
            token: this.jwtService.sign(payload),
        };
    }
    async validateUser({ username, password }) {
        const user = await this.userService.findOneWC({ username, status: 1 });
        if (user && await this.userService.compareHash(password, user.password)) {
            return user;
        }
        else {
            return false;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _b : Object])
], AuthService);


/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = exports.UserSchema = exports.User = void 0;
const tslib_1 = __webpack_require__(4);
const mongoose_1 = __webpack_require__(14);
let User = class User {
};
exports.User = User;
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "username", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "password", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "cart", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 2 }),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "status", void 0);
exports.User = User = tslib_1.__decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(34);
const user_module_1 = __webpack_require__(30);
const jwt_1 = __webpack_require__(35);
const constants_1 = __webpack_require__(38);
const passport_1 = __webpack_require__(22);
const jwt_strategy_1 = __webpack_require__(39);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt', session: false }),
            jwt_1.JwtModule.register({
                secret: constants_1.jwtConstants.secret,
                signOptions: { expiresIn: '1800s' },
            }),
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.jwtConstants = void 0;
exports.jwtConstants = {
    secret: 'vajXK+.z&@lf1<j[jZO:.oLXQv7HJVwlM!}VkAV3DvON-iM7,nfn.FA2E&bj)Z',
};


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(22);
const passport_jwt_1 = __webpack_require__(40);
const constants_1 = __webpack_require__(38);
const auth_service_1 = __webpack_require__(34);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(authService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: constants_1.jwtConstants.secret,
        });
        this.authService = authService;
    }
    async validate(payload) {
        const userData = { userId: payload._id, username: payload.username, roles: payload.role };
        return userData;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 40 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 41 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configuration = void 0;
const configuration = () => ({
    APP_NAME: process.env.APP_NAME,
    APP_ID: process.env.APP_ID,
    APP_VERSION_ID: process.env.APP_VERSION_ID,
    PREFIX: process.env.PREFIX,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DBURI: process.env.DBURI,
    DBNAME: process.env.DBNAME,
    DBUSER: process.env.DBUSER,
    DBPASS: process.env.DBPASS,
    API_URL: process.env.API_URL,
    PASSWORD_ENCRYPT_METHOD: process.env.PASSWORD_ENCRYPT_METHOD,
    API_LOG_PATH: process.env.API_LOG_PATH,
    API_LOG_LEVEL: process.env.API_LOG_LEVEL,
    API_UPLOADS: process.env.API_UPLOADS,
});
exports.configuration = configuration;


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllExceptionsFilter = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const common_service_1 = __webpack_require__(6);
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor(commonService) {
        this.commonService = commonService;
    }
    catch(exception, host) {
        console.log("exception", exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = 200;
        let message = (exception instanceof Error) ? exception.message : exception.message.error;
        if (exception.status === common_1.HttpStatus.NOT_FOUND) {
            status = common_1.HttpStatus.NOT_FOUND;
        }
        if (exception.status === common_1.HttpStatus.SERVICE_UNAVAILABLE) {
            status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
        }
        if (exception.status === common_1.HttpStatus.NOT_ACCEPTABLE) {
            status = common_1.HttpStatus.NOT_ACCEPTABLE;
        }
        if (exception.status === common_1.HttpStatus.EXPECTATION_FAILED) {
            status = common_1.HttpStatus.EXPECTATION_FAILED;
        }
        if (exception.status === common_1.HttpStatus.BAD_REQUEST) {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = exception.response.message;
        }
        response.status(status).json((this.commonService.createFailureResponse(message)));
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = tslib_1.__decorate([
    (0, common_1.Catch)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof common_service_1.CommonService !== "undefined" && common_service_1.CommonService) === "function" ? _a : Object])
], AllExceptionsFilter);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
const all_exceptions_filter_1 = __webpack_require__(43);
const common_module_1 = __webpack_require__(5);
const common_service_1 = __webpack_require__(6);
const config_1 = __webpack_require__(41);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const commonService = app.select(common_module_1.CommonModule).get(common_service_1.CommonService, { strict: true });
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(commonService));
    const globalPrefix = configService.get('PREFIX');
    app.setGlobalPrefix(globalPrefix);
    const port = configService.get('PORT');
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;