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


## ExecutionContext：切换不同上下文

Nest 支持创建 HTTP 服务、WebSocket 服务，还有基于 TCP 通信的微服务

这些不同类型的服务都需要 Guard、Interceptor、Exception Filter 功能

如何让 Guard、Interceptor、Exception Filter 跨多种上下文复用呢？

Nest 的解决方法是 **ArgumentHost** 和 **ExecutionContext** 类

- ArgumentHost (filter)

```js
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { AaaException } from './AaaException';

@Catch(AaaException)
export class AaaFilter implements ExceptionFilter {
  catch(exception: AaaException, host: ArgumentsHost) {

    if(host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      response
        .status(500)
        .json({
          aaa: exception.aaa,
          bbb: exception.bbb
        });
    } else if(host.getType() === 'ws') {

    } else if(host.getType() === 'rpc') {

    }
  }
}
```

- ExecutionContext (guard、interceptor)

ExecutionContext 是 ArgumentHost 的子类，扩展了 **getClass、getHandler** 方法

可以结合 reflector 来取出其中的 metadata

```js
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from './role';

@Injectable()
export class AaaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user && user.roles?.includes(role));
  }
}
```

## 自定义装饰器

自定义装饰器是对nest内置装饰器的一种扩展或组合，代码里是一定要用上内置的装饰器的，就像自定义Hooks要用useState/useEffect一样

class、方法 装饰器 是组合别的装饰器的，传入参数，调用下别的装饰器就好了，比如对 @SetMetadata 的封装

参数的装饰器是设置参数值

- 方法的装饰器

```js
// nest g decorator aaa --flat
import { SetMetadata } from '@nestjs/common';

export const Aaa = (...args: string[]) => SetMetadata('aaa', args)

// 装饰器的使用
@Aaa
getHello(){...}

```

使用 **applyDecorators** 调用其他装饰器

```js
import { applyDecorators, Get, UseGuards } from '@nestjs/common';
import { Aaa } from './aaa.decorator';
import { AaaGuard } from './aaa.guard';

export function Bbb(path, role) {
  return applyDecorators(
    Get(path),
    Aaa(role),
    UseGuards(AaaGuard)
  )
}
```
- 参数的装饰器 内置装饰器一样，可以使用 Pipe 做参数验证和转换

通过 createParamDecorator 来创建参数装饰器，它能拿到 ExecutionContext，进而拿到 reqeust、response，可以实现很多内置装饰器的功能，比如 @Query、@Headers 等装饰器

```js
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Ccc = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return 'ccc';
  },
);
```

## Metadata（元数据） 和 Reflector（反射器）

![Reflect MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

```js
Reflect.defineMetadata(metadataKey, metadataValue, target);

Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);


let result = Reflect.getMetadata(metadataKey, target);

let result = Reflect.getMetadata(metadataKey, target, propertyKey);
```

装饰器的方式使用

```js
@Reflect.metadata(metadataKey, metadataValue)
class C {

  @Reflect.metadata(metadataKey, metadataValue)
  method() {
  }
}
```

Reflect.metadata 装饰器再封装一层

```js
function Type(type) {
    return Reflect.metadata("design:type", type);
}
function ParamTypes(...types) {
    return Reflect.metadata("design:paramtypes", types);
}
function ReturnType(type) {
    return Reflect.metadata("design:returntype", type);
}

@ParamTypes(String, Number)
class Guang {
  constructor(text, i) {
  }

  @Type(String)
  get name() { return "text"; }

  @Type(Function)
  @ParamTypes(Number, Number)
  @ReturnType(Number)
  add(x, y) {
    return x + y;
  }
}
```

Nest 的实现原理就是通过装饰器给 class 或者对象添加元数据，然后初始化的时候取出这些元数据，进行依赖的分析，然后创建对应的实例对象就可以了。

所以说，nest 实现的核心就是 Reflect metadata 的 api

可这个 CatsController 依赖了 CatsService，但是并没有添加 metadata。

```js
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

是TypeScript 支持编译时自动添加一些 metadata 数据

ts 有一个编译选项叫做 emitDecoratorMetadata，开启它就会自动添加一些元数据

nest 的核心实现原理：通过装饰器给 class 或者对象添加 metadata，并且开启 ts 的 emitDecoratorMetadata 来自动添加类型相关的 metadata，然后运行的时候通过这些元数据来实现依赖的扫描，对象的创建等等功能。

Nest 的装饰器都是依赖 reflect-metadata 实现的，而且还提供了一个 @SetMetadata 的装饰器让我们可以给 class、method 添加一些 metadata

- 通过 reflector 获取 metadata

reflector.get(key)
reflector.getAll(key) 获取所有
reflector.getAllAndMerge(key) 获取后合并
reflector.getAllAndOverride(key) 获取第一个非空的 metadata

## forwardRef 解决循环依赖问题

- Module 循环引用

```js
import { Module, forwardRef } from '@nestjs/common';
import { BbbModule } from '...'

@Module({
  imports: [forwardRef(() => BbbModule)]
})
export class AaaModule {}
```

- Service 循环引用

```js
export class CssService {
  constructor(@Inject(forwardRef(() => DddService) private dddService: DddService ))
}
```

## Dynamic Module 动态模块

动态模块定义

```js
import { DynamicModule, Module } from '@nestjs/common';
import { BbbService } from './bbb.service';
import { BbbController } from './bbb.controller';

@Module({})
export class BbbModule {

  static register(options: Record<string, any>): DynamicModule {
    return {
      module: BbbModule,
      controllers: [BbbController],
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        BbbService,
      ],
      exports: []
    };
  }
}
```

动态模块导入

```js
@Module({
  imports: [BbbModule.register({ a: 1, b: 2 })],
  controllers: [BbbController]
})
export class AppModule {}


export class BbbController {
  constructor(private readonly bbbService: BbbService) {
    @Inject('CONFIG_OPTIONS') private configOption: Record<string, any>
  }
}
```

```js
import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface CccModuleOptions {
    aaa: number;
    bbb: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CccModuleOptions>().build();
```

这里的 register 方法其实叫啥都行，但 nest 约定了 3 种方法名：

- register 用一次模块传一次配置
- forRoot 配置一次模块用多次,一般在 AppModule 里 import
- forFeature

这些方法都可以写 xxxAsync 版本，也就是传入 useFactory 等 option，内部注册异步 provider。

这个过程也可以用 ConfigurableModuleBuilder 来生成。通过 setClassMethodName 设置方法名，通过 setExtras 设置额外的 options 处理逻辑。

并且返回的 class 都有 xxxAsync 的版本

##  Nest 和 Express Fastify 的关系

Nest 也有 middleware，但是它不是 Express 的 middleware，虽然都有 request、response、next 参数，但是它可以从 Nest 的 IOC 容器注入依赖，还可以指定作用于哪些路由

Nest 也没有和 Express 强耦合，它做了一层抽象：

1. 定义了 HttpServer 的 interface

1. 然后封装了 AbstractHttpAdapter 的 abstract class

1. 之后分别提供了 express 和 fastify 的实现

1. Adapter 是适配器的意思，也就是说 Nest 内部并没有直接依赖任何一个 http 处理的库，只是依赖了抽象的接口，想用什么库需要实现这些接口的适配器

1. 这俩适配器分别在 @nestjs/platform-express 和 @nestjs/platform-fastify 的包里

切换到 fastify

```js
// npm install fastify @nestjs/platform-fastify
import { FastifyAdapter } from '@nestjs/platform-fastify'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.listen(3000);
}
```

## Rxjs

rxjs 是一个处理异步逻辑的库，它的特点就是 operator 多，你可以通过组合 operator 来完成逻辑，不需要自己写。

nest 的 interceptor 就用了 rxjs 来处理响应，但常用的 operator 也就这么几个：

  1. tap: 不修改响应数据，执行一些额外逻辑，比如记录日志、更新缓存等
  1. map：对响应数据做修改，一般都是改成 {code, data, message} 的格式
  1. catchError：在 exception filter 之前处理抛出的异常，可以记录或者抛出别的异常
  1. timeout：处理响应超时的情况，抛出一个 TimeoutError，配合 catchErrror 可以返回超时的响应

总之，rxjs 的 operator 多，但是适合在 nest interceptor 里用的也不多。

此外，interceptor 也是可以注入依赖的，你可以通过注入模块内的各种 provider。

全局 interceptor 可以通过 APP_INTERCEPTOR 的 token 声明，这种能注入依赖，比 app.useGlobalInterceptors 更好。

## ValidationPipe 验证 post 请求参数

```sh
npm install class-validator class-transformer
```

- class-validator 包提供了基于装饰器声明的规则对对象做校验的功能

- class-transformer 则是把一个普通对象转换为某个 class 的实例对象的

声明了参数的类型为 dto 类，pipe 里拿到这个类，把参数对象通过 class-transformer 转换为 dto 类的对象，之后再用 class-validator 包来对这个对象做验证

## 自定义 Exception Filter 自定义异常时返回的响应格式

```js
// nest g filter hello --flat --no-spec

import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, Inject } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Catch(HttpException)
export class HelloFilter implements ExceptionFilter {

  @Inject(AppService)
  private service: AppService;

  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const statusCode = exception.getStatus();

    const res = exception.getResponse() as { message: string[] }; // 支持 ValidationPipe 抛出的异常
    
    response.status(statusCode).json({
       code: statusCode,
       message: res?.message?.join ? res?.message?.join(',') : exception.message, // 支持 ValidationPipe 抛出的异常
       error: 'Bad Request',
       xxx: 111,
       yyy: this.service.getHello()
    })
  }
}

```

自定义 Exception

```js
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class UnLoginException{
  message: string;

  constructor(message?){
    this.message = message;
  }
}

@Catch(UnLoginException)
export class UnloginFilter implements ExceptionFilter {
  catch(exception: UnLoginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(HttpStatus.UNAUTHORIZED).json({
      code: HttpStatus.UNAUTHORIZED,
      message: 'fail',
      data: exception.message || '用户未登录'
    }).end();
  }
}
```

## multer 实现文件上传

```sh
npm install -D @types/multer
```
单文件上传

```js
@Post('aaa')
@UseInterceptors(FileInterceptor('aaa', {
    dest: 'uploads'
}))
uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body) {
    console.log('body', body);
    console.log('file', file);
}
```

多文件上传 FileInterceptor 换成 FilesInterceptor，把 UploadedFile 换成 UploadedFiles，都是多加一个 s

```js
@Post('bbb')
@UseInterceptors(FilesInterceptor('bbb', 3, {
    dest: 'uploads'
}))
uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    console.log('body', body);
    console.log('files', files);
}

```

多个文件字段

```js
@Post('ccc')
@UseInterceptors(FileFieldsInterceptor([
    { name: 'aaa', maxCount: 2 },
    { name: 'bbb', maxCount: 3 },
], {
    dest: 'uploads'
}))
uploadFileFields(@UploadedFiles() files: { aaa?: Express.Multer.File[], bbb?: Express.Multer.File[] }, @Body() body) {
    console.log('body', body);
    console.log('files', files);
}
```

并不知道有哪些字段是 file 时可以用 AnyFilesInterceptor

```js
@Post('ddd')
@UseInterceptors(AnyFilesInterceptor({
    dest: 'uploads'
}))
uploadAnyFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    console.log('body', body);
    console.log('files', files);
}
```

指定 storage

```js
import * as multer from "multer";
import * as fs from 'fs';
import * as path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            fs.mkdirSync(path.join(process.cwd(), 'my-uploads'));
        }catch(e) {}

        cb(null, path.join(process.cwd(), 'my-uploads'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});

export { storage };
```

添加检查文件大小的逻辑

```js
// 自定义检查逻辑
import { PipeTransform, Injectable, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if(value.size > 10 * 1024) {
      throw new HttpException('文件大于 10k', HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}
```

文件大小、类型的校验这种逻辑太过常见，Nest 给封装好了，可以直接用

```js
@Post('fff')
@UseInterceptors(FileInterceptor('aaa', {
    dest: 'uploads'
}))
uploadFile3(@UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1000 }),
      new FileTypeValidator({ fileType: 'image/jpeg' }),
    ],
})) file: Express.Multer.File, @Body() body) {
    console.log('body', body);
    console.log('file', file);
}
```

自己实现这样的 validator

```js
import { FileValidator } from "@nestjs/common";

export class MyFileValidator extends FileValidator{
    constructor(options) {
        super(options);
    }

    isValid(file: Express.Multer.File): boolean | Promise<boolean> {
        if(file.size > 10000) {
            return false;
        }
        return true;
    }
    buildErrorMessage(file: Express.Multer.File): string {
        return `文件 ${file.originalname} 大小超出 10k`;
    }
}
```

## winston 自定义日志

## PM2 执行node

pm2 是 process manager，进程管理，它是第二个大版本，和前一个版本差异很大，所以叫 pm2.

pm2 的主要功能就是进程管理、日志管理、负载均衡、性能监控这些。

```sh
npm install -g pm2

pm2 start ./dist/main.js

# 超过 200M 内存自动重启
pm2 start xxx --max-memory-restart 200M

# 从 2s 开始每 3s 重启一次
pm2 start xxx --cron-restart "2/3 * * * * *"

# 当文件内容改变自动重启
pm2 start xxx --watch

# 不自动重启
pm2 start xxx --no-autorestart

# 删掉进程
pm2 delete 0

# 清空日志
pm2 flush 或者 pm2 flush 进程名|id

#  ~/.pm2/logs 下，以“进程名-out.log”和“进程名-error.log”分别保存不同进程的日志
pm2 logs

```

再就是负载均衡，node 应用是单进程的，而为了充分利用多核 cpu，我们会使用多进程来提高性能。

node 提供的 cluster 模块就是做这个的，pm2 就是基于这个实现了负载均衡。

我们只要启动进程的时候加上 -i num 就是启动 num 个进程做负载均衡的意思

```sh
# -i 启动 cpu 数量的进程
pm2 start app.js -i max 
pm2 start app.js -i 0

# 动态调整进程数
pm2 scale main 3

# 增加3个进程
pm2 scale main +3
```

性能监控

```sh
pm2 monit
```

pm2 start ecosystem.config.js 

一般都是 docker 镜像内安装 pm2 来跑 node

## MySQL

## TypeORM

## Redis

## JWT

## 权限控制

## Nginx


## 项目-会议室预定系统

```sh
nest new meeting_room_booking_system_backend

# 安装 typeorm 相关的包
npm install --save @nestjs/typeorm typeorm mysql2

```

在 AppModule 引入 TypeOrmModule：
```js
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "20090909",
      database: "meeting_room_booking_system",
      synchronize: true,
      logging: true,
      entities: [],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
          authPlugin: 'sha256_password',
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

自动创建模块
```sh
nest g resource user
```

dto参数验证
```sh
npm install --save class-validator class-transformer
```

redis
```sh
nest g module redis
nest g service redis
npm install --save redis
```

邮件
```sh
nest g resource email

npm install nodemailer --save
```

### 配置拆分

```sh
npm install --save @nestjs/config
```
```js
// appModule中导入

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: 'src/.env'
})
```

再 nest-cli.json 里加一下 编译配置
```js
// asssets 是指定 build 时复制的文件，watchAssets 是在 assets 变动之后自动重新复制
{
  "compilerOptions": {
      ...,
      "watchAssets": true,
      "assets": [
        "**/*.env"
      ]
  }
}
```
