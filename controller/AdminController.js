const { registerValidator, loginValidator } = require("../validators/admin.js");
const AdminModel = require("../models/AdminModel")
const LoginManager = require("../services/login")
const res = require("../helpers/response-helper.js")

class AdminController {
    // 注册
    static async register(ctx, next) {

        // 第一件事：先进行数据校验，通过后，再向下走
        registerValidator(ctx)

        // 第二件事：获取用户名和密码
        let { nickname, password2 } = ctx.request.body;

        // 第三件事：判断数据库中否有同名的用户名
        let currentUser = await AdminModel.findOne({
            nickname
        });
        // 若存在，抛出对应错误
        if (currentUser) {
            throw new global.errs.Existing("用户已存在", 900)
        }

        // 第四件事：需要把用户入库
        let user = await AdminModel.create({
            nickname, password: password2
        });

        // 返回数据
        ctx.body = res.json(user)
    }

    // 登录
    static async login(ctx, next) {
        // 校验
        loginValidator(ctx)

        // 得到前端传递的用户名和密码
        let { nickname, password } = ctx.request.body;

        // 验证用户名、密码、颁发token
        let user = await LoginManager.adminLogin({ nickname, password })

        // 返回数据
        ctx.body = res.json(user)
    }

    // 获取用户信息
    static async getUserInfo(ctx, next) {
        // 可在 ctx.state.user(默认) 获取用户信息
        // ctx.state.user.data 就是颁发 token 时使用的 data 数据，即用户_id
        // console.log(ctx.state.user)

        let _id = ctx.state.user.data;

        // 依据_id到数据库查找用户信息
        let userInfo = await AdminModel.findById({ _id });
        if (!userInfo) {
            throw new global.errs.AuthFailed("用户不存在")
        }

        // 返回数据（注意某些数据的私密性）
        ctx.body = res.json({ _id, nickname: userInfo.nickname })
    }
}

// 导出去一个类
module.exports = AdminController;