## 最佳实践
1. 前端（或后端）在 Apifox 上定好接口文档初稿。
2. 前后端 一起评审、完善接口文档，定好接口用例。
3. 前端 使用系统根据接口文档自动生成的 Mock 数据进入开发，无需手写 mock 规则。
4. 后端 使用接口用例 调试开发中接口，只要所有接口用例调试通过，接口就开发完成了。如开发过中接口有变化，调试的时候就自动更新了文档，零成本的保障了接口维护的及时性。
5. 后端 每次调试完一个功能就保存为一个接口用例。
6. 测试人员 直接使用接口用例测试接口。
7. 所有接口开发完成后，测试人员（也可以是后端）使用集合测试功能进行多接口集成测试，完整测试整个接口调用流程。
8. 前后端 都开发完，前端从Mock 数据切换到正式数据，联调通常都会非常顺利，因为前后端双方都完全遵守了接口定义的规范。


## 注意
1. 和 Postman 不一样，Apifox 是区分接口设计和接口运行两个概念的。
2. 接口路径 建议不要包含 HTTP 协议及域名，这部分建议在 环境管理 的前置URL里设置，接口调试时的 URL 会自动加上当前环境的前置URL。
3. 特殊情况需在接口路径要带上HTTP 协议及域名的，系统也能支持，但不建议这么做。接口调试时，系统如检测到接口路径是以http://或https://起始的，会自动忽略当前环境里前置 URL。
4. Apifox 中的 Path 参数是以大括号包裹起来表示，而非冒号起始表示。正确示例：/pets/{id}，错误示例/pets/:id。
5. 接口路径 不可包含Query 参数（即 URL 中 ?后的参数），Query 参数在下方请求参数部分填写
6. 所有参数都可以使用变量，使用方式为双大括号包裹变量名，如{{my_variable}}，表示引用名为my_variable的变量。
7. 系统内置名为BASE_URL的特殊环境变量，其值为当前环境的前置URL，使用方式{{BASE_URL}}。
8. 如用户手动添加了名为BASE_URL的环境变量，则会覆盖掉系统内置BASE_URL的值。
9. 脚本可通过 pm.environment.get('BASE_URL') 方式读取前置URL。
10. 脚本不能修改前置URL，脚本 pm.environment.set('BASE_URL','xxx')会生成一个真正的名为BASE_URL的环境变量，而不会修改前置URL。
11. Apifox 版本号大于等于 1.0.12 才支持内置BASE_URL

## 变量（接口之间传递数据）
B 接口请求参数依赖于 A 接口返回的数据，希望 B 接口发送请求的时候能获取 A 接口返回的数据作为请求参数。实现思路如下
1. A 接口使用后置操作->提取变量功能将请求完成后返回的对应数据提取到变量。
2. B 接口对应的参数值直接引用前面设置的变量

>本地值和远程值的区别
1. 所有使用到变量的地方，实际运行的时候都是读写本地值，而不会读写远程值。
2. 本地值 仅存放在本地，不会同步到云端，团队成员之间也不会相互同步，适合存放token、账号、密码之类的敏感数据。
3. 远程值 会同步到云端，主要用来团队成员之间共享数据值。

>变量类型
1. 环境变量 是最常用的变量，同一个变量可以在不同的环境设置不同的值，变量值会跟随环境切换而改变。环境变量在环境管理模块设置，查看文档：环境管理
2. 全局变量 使用方法类环境变量类似，但全局变量不会跟随环境切换而改变。
3. 临时变量 仅在单次运行接口用例或测试管理里的测试用例或测试套件过程中有效，不会持久化保存。
4. 变量优先级：临时变量 > 测试数据变量 > 环境变量 > 全局变量。

>脚本中使用变量
1. 环境变量
    ```js
    // 设置环境变量
    pm.environment.set('variable_key', 'variable_value');

    // 获取环境变量
    var variable_key = pm.environment.get('variable_key');

    // unset 环境变量
    pm.environment.unset('variable_key');
    ```
2. 全局变量
    ```js
    // 设置全局变量
    pm.globals.set('variable_key', 'variable_value');

    // 获取全局变量
    var variable_key = pm.globals.get('variable_key');

    // unset 全局变量
    pm.globals.unset('variable_key');
    ```
3. 临时变量
    ```js
        // 设置临时变量
        pm.variables.set('variable_key', 'variable_value');

        // 获取临时变量
        var variable_key = pm.variables.get('variable_key');

        // unset 临时变量
        pm.variables.unset('variable_key');
    ```

## [mock](https://www.apifox.cn/help/app/mock/)
>当你在运行 Apifox 客户端软件时，可以使用本地 mock 服务; 当你在运行 Apifox web 端时，可以使用云端 mock 服务

1. Apifox 根据接口定义里的数据结构、数据类型，自动生成 mock 规则。
2. Apifox 内置 智能 Mock 功能，根据字段名、字段数据类型，智能优化自动生成的 mock 规则。如：名称包含字符串image的string类型字段，自动 mock 出一个图片地址 URL；包含字符串time的string类型字段，自动 mock 出一个时间字符串；包含字符串city的string类型字段，自动 mock 出一个城市名。
3. Apifox 根据内置规则（可关闭），可自动识别出图片、头像、用户名、手机号、网址、日期、时间、时间戳、邮箱、省份、城市、地址、IP 等字段，从而 Mock 出非常人性化的数据。
4. 除了内置 mock 规则，用户还可以自定义规则库，满足各种个性化需求。支持使用 正则表达式、通配符 来匹配字段名自定义 mock 规则。

> 数据字段在自动 Mock 数据时，实际执行的 Mock 规则优先级顺序如下：
1. 接口详情高级 Mock 里设置的期望（根据接口参数匹配）。
2. 数据结构的字段里设置的Mock规则。
3. 数据结构的字段高级设置里设置的最大值、最小值、枚举值、Partten。
4. 项目设置-智能 Mock 设置的自定义规则。
5. 项目设置-智能 Mock 设置的内置规则。
6. 数据结构里字段的数据类型

## [使用脚本](https://www.apifox.cn/help/app/scripts/#%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F)
Apifox 包含一个基于Javascript的脚本引擎，通过脚本（JavaScript代码片段）可实现在接口请求或集合测试时添加动态行为。
>脚本可实现的功能

1. 测试（断言）请求返回结果的正确性（后置脚本）。
2. 动态修改接口请求参数，如增加接口签名参数等（前置脚本）。
3. 接口请求之间传递数据（使用脚本操作变量）。
4. 脚本可以直接 调用其他语言编写的程序，支持java(.jar)、python、php、js、BeanShell、go、shell、ruby、Lua 等语言编写的外部程序。
5. 其他
> [脚本API](https://www.apifox.cn/help/app/scripts/api-references/pm-reference/#%E5%85%A8%E5%B1%80%E6%96%B9%E6%B3%95)

## [持续集成](https://www.apifox.cn/help/app/ci/#%E4%B8%80%E3%80%81apifox-cli-%E6%96%B9%E5%BC%8F)

## 其他参考
[JSON Schema](https://www.apifox.cn/help/reference/json-schema/)
[JSON Path](https://www.apifox.cn/help/reference/json-path/)
[XPath](https://www.apifox.cn/help/reference/xpath/)
[正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)