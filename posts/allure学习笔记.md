---
title: allure学习笔记
date: 2020-10-14 15:33:57
tags:
---

![alt](/images/allure.png)

<!-- more -->

## Allure-pytest

+ 生成 allure 结果目录('--alluredir','../report/allure')
+ 生成 allure 报告
  - 安装 allure 服务('brew install allure')
  - allure generate ./reportallure -o ./allureReport --clean (reportallure是alluredir生成的xml目录，allureReport是最终生成html的目录)
  - allure serve ./allureReport (运行后，浏览器会自动跳转到allure report界面)
+ [pytest+allure+jenkins集成](https://www.cnblogs.com/hao2018/p/11135180.html)

### allure-pytest 定制化报告

1. parent_suite 最上层测试套

    ```python
    @allure.parent_suite('xxxx')
    ```

2. suite 测试套

    ```python
    @allure.suite('xxxx')
    ```

3. sub_suite 下层测试套

    ```python
    @allure.sub_suite('xxxx')
    ```

4. title 下层测试套

    ```python
    @allure.title('xxxx')
    ```

    ![1,2,3,4](./suite.png)
5. feature 标注主要功能模块

    ```python
    @allure.feature('xxxx')
    ```

    ![5](./feature.png)
6. story 标注Features功能模块下的分支功能

    ```python
    @allure.story('xxxx')
    ```

7. severity 标注测试用例的重要级别 (图表优先级)
    + blocker级别：中断缺陷（客户端程序无响应，无法执行下一步操作）
    + critical级别：临界缺陷（功能点缺失）
    + normal级别：正常    默认为这个级别
    + minor级别：次要缺陷（界面错误与UI需求不符）
    + trivial级别：轻微缺陷（必输项无提示，或者提示不规范

    ```python
    @allure.severity("trivial")
    ```

8. with allure.step 分步骤备注

    ```python
    #@allure.step("这是两个整数的比较")
    def change_env(self, env_name):
    """
    切换环境
    :param env_name:
    :return:
    """
    with allure.step(f'切换环境到: {env_name}'):
        self.click(By.XPATH, "//*[contains(@text,'环境')]")
        log.info("点击切换环境")
        self.click(By.XPATH, f"//*[@text='{env_name}']")
        log.info(f"切换到:{env_name}")
    ```

    ![8](./step.png)

9. attach 用于向测试报告中输入一些附加的信息，通常是一些测试数据信息。

    ```python
    class Attach(object):
        def __call__(self, body, name=None, attachment_type=None, extension=None):
            plugin_manager.hook.attach_data(body=body, name=name, attachment_type=attachment_type, extension=extension)
        def file(self, source, name=None, attachment_type=None, extension=None):
            plugin_manager.hook.attach_file(source=source, name=name, attachment_type=attachment_type, extension=extension)
    ```

    + name就是附件名称，body就是数据，attachment_type就是传类型
    + 附件支持的类型（TEXT，HTML，XML，PNG，JPG，JSON，OTHER）
    + 图片附件：

        ```python
        with open(r"G:\Web_automation\Learn_pytest\test_cases\img\2.jpg","rb") as file:
            file=file.read()
            allure.attach(file,"预期结果",attachment_type=allure.attachment_type.JPG)
        ```

10. issue和testcase 添加链接

    ```python
    @allure.testcase("https://home.cnblogs.com/","测试用例地址请点击跳转")  # 标记代码，你可以指定连接的名字，报告里面就会现在这个名字的连接
    @allure.issue("http://www.baidu.com")  # 标记代码，哪个写在后，在报告里面就会显示在前面
    ```

11. description 和 description_html

    ```python
    @allure.description('xxxx')
    @allure.description_html('xxxx')
    ```

## mocha-allure-reporter

+ 安装依赖包：npm install mocha-allure-reporter
+ 生成 allure 结果 mocha --reporter mocha-allure-reporter
+ 生成 allure 报告
  - 安装 allure 服务('brew install allure')
  - allure generate ./allure-results -o ./allureReport --clean
  - allure serve ./allureReport

## allure --help

Usage: allure [options] [command] [command options]
  Options:
    --help
      Print commandline help.
    -q, --quiet
      Switch on the quiet mode.
      Default: false
    -v, --verbose
      Switch on the verbose mode.
      Default: false
    --version
      Print commandline version.
      Default: false
  Commands:
    generate      Generate the report
      Usage: generate [options] The directories with allure results
        Options:
          -c, --clean
            Clean Allure report directory before generating a new one.
            Default: false
          --config
            Allure commandline config path. If specified overrides values from
            --profile and --configDirectory.
          --configDirectory
            Allure commandline configurations directory. By default uses
            ALLURE_HOME directory.
          --profile
            Allure commandline configuration profile.
          -o, --report-dir, --output
            The directory to generate Allure report into.
            Default: allure-report

    serve      Serve the report
      Usage: serve [options] The directories with allure results
        Options:
          --config
            Allure commandline config path. If specified overrides values from 
            --profile and --configDirectory.
          --configDirectory
            Allure commandline configurations directory. By default uses 
            ALLURE_HOME directory.
          -h, --host
            This host will be used to start web server for the report.
          -p, --port
            This port will be used to start web server for the report.
            Default: 0
          --profile
            Allure commandline configuration profile.

    open      Open generated report
      Usage: open [options] The report directory
        Options:
          -h, --host
            This host will be used to start web server for the report.
          -p, --port
            This port will be used to start web server for the report.
            Default: 0

    plugin      Generate the report
      Usage: plugin [options]
        Options:
          --config
            Allure commandline config path. If specified overrides values from 
            --profile and --configDirectory.
          --configDirectory
            Allure commandline configurations directory. By default uses 
            ALLURE_HOME directory.
          --profile
            Allure commandline configuration profile.

