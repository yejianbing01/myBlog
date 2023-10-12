---
title: graphQL
date: 2020-11-04 12:37:23
tags: graphQL
---

![alt](/images/graphql.png)

GraphQL 是一个用于 API 的查询语言，是一个使用基于类型系统来执行查询的服务端运行时（类型系统由你的数据定义）。GraphQL 并没有和任何特定数据库或者存储引擎绑定，而是依靠你现有的代码和数据支撑

<!-- more -->

### Schema和类型(类型定义使用 type 关键字)

GraphQL 服务可以用任何语言编写，因为我们并不依赖于任何特定语言的句法句式（譬如 JavaScript）来与 GraphQL schema 沟通，我们定义了自己的简单语言，称之为 “GraphQL schema language” —— 它和 GraphQL 的查询语言很相似，让我们能够和 GraphQL schema 之间可以无语言差异地沟通

每一个 GraphQL 服务都会定义一套类型，用以描述你可能从那个服务查询到的数据。每当查询到来，服务器就会根据 schema 验证并执行查询

- 特殊类型
每一个 GraphQL 服务都有一个 query 类型，可能有一个 mutation 类型。这两个类型和常规对象类型无差
但是它们之所以特殊，是因为它们定义了每一个 GraphQL 查询的入口
    1. Query
    1. Mutation
    ```GraphQL
    type Query {
        hero(参数名称: 参数类型): 返回值类型
        ...
    }
    ```
- 标量类型(类似基本数据类型)
    
    - Int：有符号 32 位整数
    - Float: 有符号双精度浮点值
    - String: UTF‐8 字符序列
    - Boolean: true 或者 false
    - ID: 表示一个唯一标识符，通常用以重新获取对象或者作为缓存中的键。ID 类型使用和 String 一样的方式序列化；然而将其定义为 ID 意味着并不需要人类可读型。

- 自定义标量类型(scalar)
    ```GraphQL
    scalar DateTime
    ```

- 枚举类型(enum)
枚举类型是一种特殊的标量，它限制在一个特殊的可选值集合内.
验证这个类型的任何参数是可选值的的某一个
与类型系统沟通，一个字段总是一个有限值集合的其中一个值
    ```GraphQL
    enum Flag {
        EMPIRE
        JEDI
    }
    ```
- 列表和非空( [ 标量类型 ]! )

    ```GraphQL
    array: [String!]        # 表示数组本身可以为空，但是不能有任何空值的成员
    array: null             # 有效
    array: []               # 有效
    array: ['a', 'b']       # 有效
    array: ['a', null, 'b'] # 错误

    array: [String]!        # 表示数组本身不允许为null
    array: null             # 错误
    array: []               # 有效
    array: ['a', 'b']       # 有效
    array: ['a', null, 'b'] # 有效
    ```
- 接口
跟许多类型系统一样，GraphQL 支持接口。一个接口是一个抽象类型，它包含某些字段。
对象类型必须包含这些字段，才能算实现了这个接口

    ```GraphQL
    interface User {
        id: ID!
        name: String
        age: Int
        friend: [String!]
    }

    type you implements User {
        id: ID!
        name: String
        age: Int
        friend: [String!]
        # 实现类型特有的字段
        car: [String]!
    }
    ```
- 联合类型(union) ?
联合类型和接口十分相似，但是它并不指定类型之间的任何共同字段
    ```GraphQL
    # 任何返回一个 SearchResult 类型的地方，都可能得到一个 Human、Droid 或者 Starship。
    # 注意，联合类型的成员需要是具体对象类型；你不能使用接口或者其他联合类型来创造一个联合类型
    union SearchResult = Human | Droid | Starship

    ```
- 输入类型(input)
复杂对象作为参数传递给字段。这在变更（mutation）中特别有用，因为有时候你需要传递一整个对象作为新建对象
在 GraphQL schema language 中，输入对象看上去和常规对象一模一样，除了关键字是 input 而不是 type
输入对象类型上的字段本身也可以指代输入对象类型，但是你不能在你的 schema 混淆输入和输出类型
输入对象类型的字段当然也不能拥有参数
    ```GraphQL
    input User {
        id: ID!
        name: String
        age: Int
        friend: [String!]
    }

    type Query {
        getUserInfo(user: User): Type
    }

    ```

### 根字段 & 解析器(resolver)
每一个 GraphQL 服务端应用的顶层，必有一个类型代表着所有进入 GraphQL API 可能的入口点，我们将它称之为 Root 类型或 Query 类型

```GraphQL

Query {
    getGoods: (obj, args, context, info) => {
        # obj 上一级对象，如果字段属于根节点查询类型通常不会被使用
        # args 可以提供在 GraphQL 查询中传入的参数
        # context 会被提供给所有解析器，并且持有重要的上下文信息比如当前登入的用户或者数据库访问对象
        # info 一个保存与当前查询相关的字段特定信息以及 schema 详细信息的值
    },
}

```

- 异步解析器
    ```GraphQL
    human(obj, args, context, info) {
        return context.db.loadHumanByID(args.id).then(
            userData => new Human(userData)
        )
    }
    ```
    context 提供了一个数据库访问对象，用来通过查询中传递的参数 id 来查询数据，因为从数据库拉取数据的过程是一个异步操作，该方法返回了一个 Promise 对象，在 JavaScript 语言中 Promise 对象用来处理异步操作，但在许多语言中存在相同的概念，通常称作 Futures、Tasks 或者 Defferred。当数据库返回查询结果，我们就能构造并返回一个新的 Human 对象

    这里要注意的是，只有解析器能感知到 Promise 的进度，GraphQL 查询只关注一个包含着 name 属性的 human 字段是否返回，在执行期间如果异步操作没有完成，则 GraphQL 会一直等待下去，因此在这个环节需要关注异步处理上的优化

- 不重要的解析器 ?
- 标量强制 ?
- 列表解析器 ?
