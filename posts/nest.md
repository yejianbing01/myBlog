---
title: 'Nest.js学习笔记'
date: '2023-11-17'
---

## CLI
```sh
npm install -g @nestjs/cli
# 时不时升级下版本，不然可能用它创建的项目版本不是最新的
npm update -g @nestjs/cli

nest new 快速创建项目
nest generate 快速生成各种代码
nest build 使用 tsc 或者 webpack 构建代码
nest start 启动开发服务，支持 watch 和调试
nest info 打印 node、npm、nest 包的依赖版本

# 很多选项都可以在 nest-cli.json 里配置，比如 generateOptions、compilerOptions 等
```
## 处理 http 请求

5 种 HTTP 数据传输方式

```ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  // content-type: application/x-www-form-urlencoded
  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  // query
  @Get()
  findAll(@Query('name') name: string, @Query('age') age: number) {
    return this.personService.findAll(name, age);
  }

  // url param
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(+id);
  }

  // content-type: application/json
  @Post('body')
  body(@Body() createPersonDto: CreatePersonDto) {
    return `received: ${JSON.stringify(createPersonDto)}`;
  }

  // content-type: multipart/form-data
  @Post('file')
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: 'uploads/',
    }),
  )
  file(
    @Body() createPersonDto: CreatePersonDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(files);
    return `received: ${JSON.stringify(createPersonDto)}`;
  }
}

```

## IOC(Inverse Of Control 的英文缩写)，反转控制

它有一个放对象的容器，程序初始化的时候会扫描 class 上声明的依赖关系，然后把这些 class 都给 new 一个实例放到容器里。

创建对象的时候，还会把它们依赖的对象注入进去。这种依赖注入的方式叫做 Dependency Injection，简称 DI

IOC 机制是在 class 上标识哪些是可以被注入的，它的依赖是什么，然后从入口开始扫描这些对象和依赖，自动创建和组装对象。

Nest 里通过 @Controller 声明可以被注入的 controller，通过 @Injectable 声明可以被注入也可以注入别的对象的 provider，然后在 @Module 声明的模块里引入。

并且 Nest 还提供了 Module 和 Module 之间的 import，可以引入别的模块的 provider 来注入。

虽然 Nest 这套实现了 IOC 的模块机制看起来繁琐，但是却解决了后端系统的对象依赖关系错综复杂的痛点问题。

## debug

node 代码可以加上 --inspect 或者 --inspect-brk 启动调试 ws 服务，然后用 Chrome DevTools 或者 vscode debugger 连上来调试。

nest 项目的调试也是 node 调试，可以使用 nest start --debug 启动 ws 服务，然后在 vscode 里 attach 上来调试，也可以添加个调试配置来运行 npm run start:dev。

nest 项目最方便的调试方式还是在 VSCode 里添加 npm run start:dev 的调试配置
```js
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "debug nest",
            "runtimeExecutable": "npm",
            "args": [
                "run",
                "start:dev",
            ],
            "skipFiles": [
                "<node_internals>/**"
            ],
            "console": "integratedTerminal"
        }
    ]
}
```

## 多种 Provider
Nest 实现了 IOC 容器，会从入口模块开始扫描，分析 Module 之间的引用关系，对象之间的依赖关系，自动把 provider 注入到目标对象。

provider 一般都是用 @Injectable 修饰的 class

- **useClass**
```js
// 在 Module 的 providers 里声明
@Module({
  imports: [PersonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// 其实这是一种简写，完整的写法是这样的：
@Module({
  imports: [PersonModule],
  controllers: [AppController],
  providers: [{
    provide: AppService,
    useClass: AppService
  }],
})
export class AppModule {}
// 通过 provide 指定注入的 token，通过 useClass 指定注入的对象的类，Nest 会自动对它做实例化再注入
```

- **useValue** 除了指定 class 外，还可以直接指定一个值，让 IOC 容器来注入
```js
@Module({
  imports: [PersonModule],
  controllers: [AppController],
  providers: [{
    provide: 'person',
    useValue: {
        name: '张三',
        age: 16
    }
  }],
})
export class AppModule {}
```

- **useFactory** provider 的值可能是动态产生的
```js
@Module({
  imports: [PersonModule],
  controllers: [AppController],
  providers: [{
    provide: 'person',
    useFactory() {
        return {
            name: '张三',
            age: 16
        }
    }
  }],
})
export class AppModule {}

//  useFactory 也是支持参数的注入, useFactory 支持异步
@Module({
  imports: [PersonModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
        provide: 'person',
        useValue: {
            name: '张三',
            age: 16
        }
    },
    { 
        provide: 'person3',
        useFactory(person: {name: string}, appService: AppService) {
            return {
                name: '张三',
                age: 16
            }
        }
    }
  ],
})
export class AppModule {}

```

- **useExisting** 只是用来起别名的，有的场景下会用到。比如 @nestjs/typeorm 里就用到了 useValue、useFactory、useExisting：
```js
// 就是给 person2 的 token 的 provider 起个新的 token 叫做 person4
@Module({
  imports: [PersonModule],
  controllers: [AppController],
  providers: [
    { 
        provide: 'person4',
        useExisting: 'person2'
    }
  ],
})
export class AppModule {}
```

## 生命周期

1. onModuleInit
1. onApplicationBootstrap
    ...Start listeners...
    ...Application is running...
1. onModuleDestroy
1. beforeApplicationShutdown
    ...Stop listeners...
1. onApplicationShutdown
    ...Process exits...

## AOP 架构
![AOP](/images/aop.png)
![AOP顺序](/images/aop顺序.png)
Nest 实现 AOP 的方式更多，一共有五种，包括 
- Middleware 中间件
- Guard
- Pipe 
- Interceptor
- ExceptionFilter

### Middleware 中间件
- 全局中间件
```js
import { NextFunction, Request, Response } from 'express';

app.use(function (req: Request, res: Response, next: NextFunction) {
    console.log('before request', req.url);
    next();
    console.log('after request', res.statusCode);
});
```

- 路由中间件

```sh
# 用 nest cli 创建一个路由中间件。--no-spec 是不生成测试文件，--flat 是平铺，不生成目录
nest g middleware log --no-spec --flat
```
```js
// log.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    next();
  }
}

```

```js
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogMiddleware } from './log.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('person*');
  }

}
```

### Guard 路由守卫

可以用于在调用某个 Controller 之前判断权限，返回 true 或者 false 来决定是否放行

![Guard](/images/guard.png)

```sh
# 创建守卫
nest g guard login --no-spec --flat
```

```js
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('login check');
    return false;
  }
}
```

- 在 Controller 里启用
```js
import { LoginGuard } from './login.guard';

@UseGuards(LoginGuard)
@Get()
getHello(): string {
    return this.appService.getHello();
}
```

- 全局启用 ①

这样每个路由都会应用这个 Guard

```js
app.useGlobalGuards(new LoginGuard());
```

- 全局启用 ②

方式一：是手动 new 的 Guard 实例，不在 IoC 容器里

而用 provider 的方式声明的 Guard 是在 IoC 容器里的，可以注入别的 provider

```js
// app.module.ts
@Module({
  imports: [PersonModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
  ],
})
```

### Interceptor 拦截器

![Interceptor](/images/interceptor.png)

```sh
# 创建拦截器
nest g interceptor time --no-spec --flat
```

```js
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();

    // 可以获取 controller 和 handler
    console.log(context.getClass(), context.getHandler());

    return next.handle().pipe(
      tap(() => {
        console.log('time: ', Date.now() - startTime);
      }),
    );
  }
}
```

Interceptor 要实现 NestInterceptor 接口，实现 intercept 方法，调用 next.handle() 就会调用目标 Controller，可以在之前和之后加入一些处理逻辑

Controller 之前之后的处理逻辑可能是异步的。Nest 里通过 rxjs 来组织它们，所以可以使用 rxjs 的各种 operator

- 单个路由启用

```js
  @UseInterceptors(TimeInterceptor)
  getHello(): string {
    return this.appService.getHello();
  }
```

- controller 级别启动

```js
@UseInterceptors(TimeInterceptor)
export class AppController {...}
```

- 全局启用 ①

这样每个路由都会应用这个 Guard

```js
app.useGlobalInterceptors(new TimeInterceptor());
```

- 全局启用 ②

```js
// app.module.ts
@Module({
  providers: [
    ...,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeInterceptor,
    },
  ],
})
```

### Pipe 管道，用来对参数做一些检验和转换

![pipe](/images/pipe.png)

```sh
# 创建一个pipe
nest g pipe validate --no-spec --flat
```

Pipe 要实现 PipeTransform 接口，实现 transform 方法，里面可以对传入的参数值 value 做参数验证，比如格式、类型是否正确，不正确就抛出异常。也可以做转换，返回转换后的值

```js
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {

    if(Number.isNaN(parseInt(value))) {
      throw new BadRequestException(`参数${metadata.data}错误`)
    }

    return typeof value === 'number' ? value * 10 : parseInt(value) * 10;
  }
}

```

```js
// 使用 pipe
  @Get('ccc')
  ccc(@Query('num', ValidatePipe) num: number) {
    return num + 1;
  }
```

**内置 pipe**

- ValidationPipe
- ParseIntPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe
- DefaultValuePipe
- ParseEnumPipe
- ParseFloatPipe
- ParseFilePipe

同样，Pipe 可以只对某个参数生效，或者整个 Controller 都生效

### ExceptionFilter

ExceptionFilter 可以对抛出的异常做处理，返回对应的响应

![filter](/images/filter.png)

```sh
# 创建一个 filter
nest g filter test --no-spec --flat
```

```js
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class TestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();

    response.status(400).json({
      statusCode: 400,
      message: 'test: ' + exception.message,
    });
  }
}

```

Nest 内置了很多 http 相关的异常，都是 HttpException 的子类。当然，也可以自己扩展

- BadRequestException

- UnauthorizedException

- NotFoundException

- ForbiddenException

- NotAcceptableException

- RequestTimeoutException

- ConflictException

- GoneException

- PayloadTooLargeException

- UnsupportedMediaTypeException

- UnprocessableException

- InternalServerErrorException

- NotImplementedException

- BadGatewayException

- ServiceUnavailableException

- GatewayTimeoutException


Nest 通过这样的方式实现了异常到响应的对应关系，代码里只要抛出不同的异常，就会返回对应的响应

同样，filter 可以只对某个 handler 生效，或者整个 Controller 生效，或者 全局生效

### 几种 AOP 机制的顺序

Middleware、Guard、Pipe、Interceptor、ExceptionFilter 都可以透明的添加某种处理逻辑到某个路由或者全部路由，这就是 AOP 的好处

![aop顺序](/images/aop顺序.png)

### IOC AOP 总结

- Nest 基于 express 这种 http 平台做了一层封装，应用了 MVC、IOC、AOP 等架构思想。

- MVC 就是 Model、View Controller 的划分，请求先经过 Controller，然后调用 Model 层的 Service、Repository 完成业务逻辑，最后返回对应的 View。

- IOC 是指 Nest 会自动扫描带有 @Controller、@Injectable 装饰器的类，创建它们的对象，并根据依赖关系自动注入它依赖的对象，免去了手动创建和组装对象的麻烦。

- AOP 则是把通用逻辑抽离出来，通过切面的方式添加到某个地方，可以复用和动态增删切面逻辑。

- Nest 的 Middleware、Guard、Interceptor、Pipe、ExceptionFilter 都是 AOP 思想的实现，只不过是不同位置的切面，它们都可以灵活的作用在某个路由或者全部路由，这就是 AOP 的优势。

## Nest 全部装饰器

- @Module： 声明 Nest 模块

- @Controller：声明模块里的 controller

- @Injectable：声明模块里可以注入的 provider

- @Inject：通过 token 手动指定注入的 provider，token 可以是 class 或者 string

- @Optional：声明注入的 provider 是可选的，可以为空

- @Global：声明全局模块

- @Catch：声明 exception filter 处理的 exception 类型

- @UseFilters：路由级别使用 exception filter

- @UsePipes：路由级别使用 pipe

- @UseInterceptors：路由级别使用 interceptor

- @SetMetadata：在 class 或者 handler 上添加 metadata

- @Get、@Post、@Put、@Delete、@Patch、@Options、@Head：声明 get、post、put、delete、patch、options、head 的请求方式

- @Param：取出 url 中的参数，比如 /aaa/:id 中的 id

- @Query: 取出 query 部分的参数，比如 /aaa?name=xx 中的 name

- @Body：取出请求 body，通过 dto class 来接收

- @Headers：取出某个或全部请求头

- @Ip 拿到请求的 ip

- @Session：取出 session 对象，需要启用 express-session 中间件

- @HostParm： 取出 host 里的参数

- @Req、@Request：注入 request 对象

- @Res、@Response：注入 response 对象，一旦注入了这个 Nest 就不会把返回值作为响应了，除非指定 passthrough 为true

- @Next：注入调用下一个 handler 的 next 方法

- @HttpCode： 修改响应的状态码

- @Header：修改响应头

- @Redirect：指定重定向的 url

- @Render：指定渲染用的模版引擎

### 使用 session 需要安装一个 express 中间件
```sh
npm install express-session
```

```js

```