# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### PythonFunction <a name="PythonFunction" id="uv-python-lambda.PythonFunction"></a>

#### Initializers <a name="Initializers" id="uv-python-lambda.PythonFunction.Initializer"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

new PythonFunction(scope: Construct, id: string, props: PythonFunctionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#uv-python-lambda.PythonFunction.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#uv-python-lambda.PythonFunction.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#uv-python-lambda.PythonFunction.Initializer.parameter.props">props</a></code> | <code><a href="#uv-python-lambda.PythonFunctionProps">PythonFunctionProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="uv-python-lambda.PythonFunction.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="uv-python-lambda.PythonFunction.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="uv-python-lambda.PythonFunction.Initializer.parameter.props"></a>

- *Type:* <a href="#uv-python-lambda.PythonFunctionProps">PythonFunctionProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#uv-python-lambda.PythonFunction.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#uv-python-lambda.PythonFunction.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#uv-python-lambda.PythonFunction.addEventSource">addEventSource</a></code> | Adds an event source to this function. |
| <code><a href="#uv-python-lambda.PythonFunction.addEventSourceMapping">addEventSourceMapping</a></code> | Adds an event source that maps to this AWS Lambda function. |
| <code><a href="#uv-python-lambda.PythonFunction.addFunctionUrl">addFunctionUrl</a></code> | Adds a url to this lambda function. |
| <code><a href="#uv-python-lambda.PythonFunction.addPermission">addPermission</a></code> | Adds a permission to the Lambda resource policy. |
| <code><a href="#uv-python-lambda.PythonFunction.addToRolePolicy">addToRolePolicy</a></code> | Adds a statement to the IAM role assumed by the instance. |
| <code><a href="#uv-python-lambda.PythonFunction.configureAsyncInvoke">configureAsyncInvoke</a></code> | Configures options for asynchronous invocation. |
| <code><a href="#uv-python-lambda.PythonFunction.considerWarningOnInvokeFunctionPermissions">considerWarningOnInvokeFunctionPermissions</a></code> | A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function. |
| <code><a href="#uv-python-lambda.PythonFunction.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this Lambda. |
| <code><a href="#uv-python-lambda.PythonFunction.grantInvokeCompositePrincipal">grantInvokeCompositePrincipal</a></code> | Grant multiple principals the ability to invoke this Lambda via CompositePrincipal. |
| <code><a href="#uv-python-lambda.PythonFunction.grantInvokeLatestVersion">grantInvokeLatestVersion</a></code> | Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda. |
| <code><a href="#uv-python-lambda.PythonFunction.grantInvokeUrl">grantInvokeUrl</a></code> | Grant the given identity permissions to invoke this Lambda Function URL. |
| <code><a href="#uv-python-lambda.PythonFunction.grantInvokeVersion">grantInvokeVersion</a></code> | Grant the given identity permissions to invoke the given version of this Lambda. |
| <code><a href="#uv-python-lambda.PythonFunction.metric">metric</a></code> | Return the given named metric for this Function. |
| <code><a href="#uv-python-lambda.PythonFunction.metricDuration">metricDuration</a></code> | How long execution of this Lambda takes. |
| <code><a href="#uv-python-lambda.PythonFunction.metricErrors">metricErrors</a></code> | How many invocations of this Lambda fail. |
| <code><a href="#uv-python-lambda.PythonFunction.metricInvocations">metricInvocations</a></code> | How often this Lambda is invoked. |
| <code><a href="#uv-python-lambda.PythonFunction.metricThrottles">metricThrottles</a></code> | How often this Lambda is throttled. |
| <code><a href="#uv-python-lambda.PythonFunction.addAlias">addAlias</a></code> | Defines an alias for this function. |
| <code><a href="#uv-python-lambda.PythonFunction.addEnvironment">addEnvironment</a></code> | Adds an environment variable to this Lambda function. |
| <code><a href="#uv-python-lambda.PythonFunction.addLayers">addLayers</a></code> | Adds one or more Lambda Layers to this Lambda function. |
| <code><a href="#uv-python-lambda.PythonFunction.invalidateVersionBasedOn">invalidateVersionBasedOn</a></code> | Mix additional information into the hash of the Version object. |

---

##### `toString` <a name="toString" id="uv-python-lambda.PythonFunction.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="uv-python-lambda.PythonFunction.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="uv-python-lambda.PythonFunction.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventSource` <a name="addEventSource" id="uv-python-lambda.PythonFunction.addEventSource"></a>

```typescript
public addEventSource(source: IEventSource): void
```

Adds an event source to this function.

Event sources are implemented in the aws-cdk-lib/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:
```
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
myFunction.addEventSource(new SqsEventSource(myQueue));
```

###### `source`<sup>Required</sup> <a name="source" id="uv-python-lambda.PythonFunction.addEventSource.parameter.source"></a>

- *Type:* aws-cdk-lib.aws_lambda.IEventSource

---

##### `addEventSourceMapping` <a name="addEventSourceMapping" id="uv-python-lambda.PythonFunction.addEventSourceMapping"></a>

```typescript
public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
```

Adds an event source that maps to this AWS Lambda function.

###### `id`<sup>Required</sup> <a name="id" id="uv-python-lambda.PythonFunction.addEventSourceMapping.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="uv-python-lambda.PythonFunction.addEventSourceMapping.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventSourceMappingOptions

---

##### `addFunctionUrl` <a name="addFunctionUrl" id="uv-python-lambda.PythonFunction.addFunctionUrl"></a>

```typescript
public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
```

Adds a url to this lambda function.

###### `options`<sup>Optional</sup> <a name="options" id="uv-python-lambda.PythonFunction.addFunctionUrl.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlOptions

---

##### `addPermission` <a name="addPermission" id="uv-python-lambda.PythonFunction.addPermission"></a>

```typescript
public addPermission(id: string, permission: Permission): void
```

Adds a permission to the Lambda resource policy.

> [Permission for details.](Permission for details.)

###### `id`<sup>Required</sup> <a name="id" id="uv-python-lambda.PythonFunction.addPermission.parameter.id"></a>

- *Type:* string

The id for the permission construct.

---

###### `permission`<sup>Required</sup> <a name="permission" id="uv-python-lambda.PythonFunction.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.Permission

The permission to grant to this Lambda function.

---

##### `addToRolePolicy` <a name="addToRolePolicy" id="uv-python-lambda.PythonFunction.addToRolePolicy"></a>

```typescript
public addToRolePolicy(statement: PolicyStatement): void
```

Adds a statement to the IAM role assumed by the instance.

###### `statement`<sup>Required</sup> <a name="statement" id="uv-python-lambda.PythonFunction.addToRolePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `configureAsyncInvoke` <a name="configureAsyncInvoke" id="uv-python-lambda.PythonFunction.configureAsyncInvoke"></a>

```typescript
public configureAsyncInvoke(options: EventInvokeConfigOptions): void
```

Configures options for asynchronous invocation.

###### `options`<sup>Required</sup> <a name="options" id="uv-python-lambda.PythonFunction.configureAsyncInvoke.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventInvokeConfigOptions

---

##### `considerWarningOnInvokeFunctionPermissions` <a name="considerWarningOnInvokeFunctionPermissions" id="uv-python-lambda.PythonFunction.considerWarningOnInvokeFunctionPermissions"></a>

```typescript
public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
```

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases.
This function is overridden as a noOp for QualifiedFunctionBase.

###### `scope`<sup>Required</sup> <a name="scope" id="uv-python-lambda.PythonFunction.considerWarningOnInvokeFunctionPermissions.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `action`<sup>Required</sup> <a name="action" id="uv-python-lambda.PythonFunction.considerWarningOnInvokeFunctionPermissions.parameter.action"></a>

- *Type:* string

---

##### `grantInvoke` <a name="grantInvoke" id="uv-python-lambda.PythonFunction.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="uv-python-lambda.PythonFunction.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeCompositePrincipal` <a name="grantInvokeCompositePrincipal" id="uv-python-lambda.PythonFunction.grantInvokeCompositePrincipal"></a>

```typescript
public grantInvokeCompositePrincipal(compositePrincipal: CompositePrincipal): Grant[]
```

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

###### `compositePrincipal`<sup>Required</sup> <a name="compositePrincipal" id="uv-python-lambda.PythonFunction.grantInvokeCompositePrincipal.parameter.compositePrincipal"></a>

- *Type:* aws-cdk-lib.aws_iam.CompositePrincipal

---

##### `grantInvokeLatestVersion` <a name="grantInvokeLatestVersion" id="uv-python-lambda.PythonFunction.grantInvokeLatestVersion"></a>

```typescript
public grantInvokeLatestVersion(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="uv-python-lambda.PythonFunction.grantInvokeLatestVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeUrl` <a name="grantInvokeUrl" id="uv-python-lambda.PythonFunction.grantInvokeUrl"></a>

```typescript
public grantInvokeUrl(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda Function URL.

###### `grantee`<sup>Required</sup> <a name="grantee" id="uv-python-lambda.PythonFunction.grantInvokeUrl.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeVersion` <a name="grantInvokeVersion" id="uv-python-lambda.PythonFunction.grantInvokeVersion"></a>

```typescript
public grantInvokeVersion(grantee: IGrantable, version: IVersion): Grant
```

Grant the given identity permissions to invoke the given version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="uv-python-lambda.PythonFunction.grantInvokeVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `version`<sup>Required</sup> <a name="version" id="uv-python-lambda.PythonFunction.grantInvokeVersion.parameter.version"></a>

- *Type:* aws-cdk-lib.aws_lambda.IVersion

---

##### `metric` <a name="metric" id="uv-python-lambda.PythonFunction.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Function.

###### `metricName`<sup>Required</sup> <a name="metricName" id="uv-python-lambda.PythonFunction.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricDuration` <a name="metricDuration" id="uv-python-lambda.PythonFunction.metricDuration"></a>

```typescript
public metricDuration(props?: MetricOptions): Metric
```

How long execution of this Lambda takes.

Average over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricErrors` <a name="metricErrors" id="uv-python-lambda.PythonFunction.metricErrors"></a>

```typescript
public metricErrors(props?: MetricOptions): Metric
```

How many invocations of this Lambda fail.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInvocations` <a name="metricInvocations" id="uv-python-lambda.PythonFunction.metricInvocations"></a>

```typescript
public metricInvocations(props?: MetricOptions): Metric
```

How often this Lambda is invoked.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottles` <a name="metricThrottles" id="uv-python-lambda.PythonFunction.metricThrottles"></a>

```typescript
public metricThrottles(props?: MetricOptions): Metric
```

How often this Lambda is throttled.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addAlias` <a name="addAlias" id="uv-python-lambda.PythonFunction.addAlias"></a>

```typescript
public addAlias(aliasName: string, options?: AliasOptions): Alias
```

Defines an alias for this function.

The alias will automatically be updated to point to the latest version of
the function as it is being updated during a deployment.

```ts
declare const fn: lambda.Function;

fn.addAlias('Live');

// Is equivalent to

new lambda.Alias(this, 'AliasLive', {
  aliasName: 'Live',
  version: fn.currentVersion,
});
```

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="uv-python-lambda.PythonFunction.addAlias.parameter.aliasName"></a>

- *Type:* string

The name of the alias.

---

###### `options`<sup>Optional</sup> <a name="options" id="uv-python-lambda.PythonFunction.addAlias.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.AliasOptions

Alias options.

---

##### `addEnvironment` <a name="addEnvironment" id="uv-python-lambda.PythonFunction.addEnvironment"></a>

```typescript
public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
```

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

###### `key`<sup>Required</sup> <a name="key" id="uv-python-lambda.PythonFunction.addEnvironment.parameter.key"></a>

- *Type:* string

The environment variable key.

---

###### `value`<sup>Required</sup> <a name="value" id="uv-python-lambda.PythonFunction.addEnvironment.parameter.value"></a>

- *Type:* string

The environment variable's value.

---

###### `options`<sup>Optional</sup> <a name="options" id="uv-python-lambda.PythonFunction.addEnvironment.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EnvironmentOptions

Environment variable options.

---

##### `addLayers` <a name="addLayers" id="uv-python-lambda.PythonFunction.addLayers"></a>

```typescript
public addLayers(layers: ...ILayerVersion[]): void
```

Adds one or more Lambda Layers to this Lambda function.

###### `layers`<sup>Required</sup> <a name="layers" id="uv-python-lambda.PythonFunction.addLayers.parameter.layers"></a>

- *Type:* ...aws-cdk-lib.aws_lambda.ILayerVersion[]

the layers to be added.

---

##### `invalidateVersionBasedOn` <a name="invalidateVersionBasedOn" id="uv-python-lambda.PythonFunction.invalidateVersionBasedOn"></a>

```typescript
public invalidateVersionBasedOn(x: string): void
```

Mix additional information into the hash of the Version object.

The Lambda Function construct does its best to automatically create a new
Version when anything about the Function changes (its code, its layers,
any of the other properties).

However, you can sometimes source information from places that the CDK cannot
look into, like the deploy-time values of SSM parameters. In those cases,
the CDK would not force the creation of a new Version object when it actually
should.

This method can be used to invalidate the current Version object. Pass in
any string into this method, and make sure the string changes when you know
a new Version needs to be created.

This method may be called more than once.

###### `x`<sup>Required</sup> <a name="x" id="uv-python-lambda.PythonFunction.invalidateVersionBasedOn.parameter.x"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#uv-python-lambda.PythonFunction.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#uv-python-lambda.PythonFunction.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#uv-python-lambda.PythonFunction.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#uv-python-lambda.PythonFunction.classifyVersionProperty">classifyVersionProperty</a></code> | Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource. |
| <code><a href="#uv-python-lambda.PythonFunction.fromFunctionArn">fromFunctionArn</a></code> | Import a lambda function into the CDK using its ARN. |
| <code><a href="#uv-python-lambda.PythonFunction.fromFunctionAttributes">fromFunctionAttributes</a></code> | Creates a Lambda function object which represents a function not defined within this stack. |
| <code><a href="#uv-python-lambda.PythonFunction.fromFunctionName">fromFunctionName</a></code> | Import a lambda function into the CDK using its name. |
| <code><a href="#uv-python-lambda.PythonFunction.metricAll">metricAll</a></code> | Return the given named metric for this Lambda. |
| <code><a href="#uv-python-lambda.PythonFunction.metricAllConcurrentExecutions">metricAllConcurrentExecutions</a></code> | Metric for the number of concurrent executions across all Lambdas. |
| <code><a href="#uv-python-lambda.PythonFunction.metricAllDuration">metricAllDuration</a></code> | Metric for the Duration executing all Lambdas. |
| <code><a href="#uv-python-lambda.PythonFunction.metricAllErrors">metricAllErrors</a></code> | Metric for the number of Errors executing all Lambdas. |
| <code><a href="#uv-python-lambda.PythonFunction.metricAllInvocations">metricAllInvocations</a></code> | Metric for the number of invocations of all Lambdas. |
| <code><a href="#uv-python-lambda.PythonFunction.metricAllThrottles">metricAllThrottles</a></code> | Metric for the number of throttled invocations of all Lambdas. |
| <code><a href="#uv-python-lambda.PythonFunction.metricAllUnreservedConcurrentExecutions">metricAllUnreservedConcurrentExecutions</a></code> | Metric for the number of unreserved concurrent executions across all Lambdas. |

---

##### `isConstruct` <a name="isConstruct" id="uv-python-lambda.PythonFunction.isConstruct"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="uv-python-lambda.PythonFunction.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="uv-python-lambda.PythonFunction.isOwnedResource"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="uv-python-lambda.PythonFunction.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="uv-python-lambda.PythonFunction.isResource"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="uv-python-lambda.PythonFunction.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `classifyVersionProperty` <a name="classifyVersionProperty" id="uv-python-lambda.PythonFunction.classifyVersionProperty"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.classifyVersionProperty(propertyName: string, locked: boolean)
```

Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource.

See 'currentVersion' section in the module README for more details.

###### `propertyName`<sup>Required</sup> <a name="propertyName" id="uv-python-lambda.PythonFunction.classifyVersionProperty.parameter.propertyName"></a>

- *Type:* string

The property to classify.

---

###### `locked`<sup>Required</sup> <a name="locked" id="uv-python-lambda.PythonFunction.classifyVersionProperty.parameter.locked"></a>

- *Type:* boolean

whether the property should be associated to the version or not.

---

##### `fromFunctionArn` <a name="fromFunctionArn" id="uv-python-lambda.PythonFunction.fromFunctionArn"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.fromFunctionArn(scope: Construct, id: string, functionArn: string)
```

Import a lambda function into the CDK using its ARN.

For `Function.addPermissions()` to work on this imported lambda, make sure that is
in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="uv-python-lambda.PythonFunction.fromFunctionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="uv-python-lambda.PythonFunction.fromFunctionArn.parameter.id"></a>

- *Type:* string

---

###### `functionArn`<sup>Required</sup> <a name="functionArn" id="uv-python-lambda.PythonFunction.fromFunctionArn.parameter.functionArn"></a>

- *Type:* string

---

##### `fromFunctionAttributes` <a name="fromFunctionAttributes" id="uv-python-lambda.PythonFunction.fromFunctionAttributes"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.fromFunctionAttributes(scope: Construct, id: string, attrs: FunctionAttributes)
```

Creates a Lambda function object which represents a function not defined within this stack.

For `Function.addPermissions()` to work on this imported lambda, set the sameEnvironment property to true
if this imported lambda is in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="uv-python-lambda.PythonFunction.fromFunctionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent construct.

---

###### `id`<sup>Required</sup> <a name="id" id="uv-python-lambda.PythonFunction.fromFunctionAttributes.parameter.id"></a>

- *Type:* string

The name of the lambda construct.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="uv-python-lambda.PythonFunction.fromFunctionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionAttributes

the attributes of the function to import.

---

##### `fromFunctionName` <a name="fromFunctionName" id="uv-python-lambda.PythonFunction.fromFunctionName"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.fromFunctionName(scope: Construct, id: string, functionName: string)
```

Import a lambda function into the CDK using its name.

###### `scope`<sup>Required</sup> <a name="scope" id="uv-python-lambda.PythonFunction.fromFunctionName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="uv-python-lambda.PythonFunction.fromFunctionName.parameter.id"></a>

- *Type:* string

---

###### `functionName`<sup>Required</sup> <a name="functionName" id="uv-python-lambda.PythonFunction.fromFunctionName.parameter.functionName"></a>

- *Type:* string

---

##### `metricAll` <a name="metricAll" id="uv-python-lambda.PythonFunction.metricAll"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.metricAll(metricName: string, props?: MetricOptions)
```

Return the given named metric for this Lambda.

###### `metricName`<sup>Required</sup> <a name="metricName" id="uv-python-lambda.PythonFunction.metricAll.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricAll.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllConcurrentExecutions` <a name="metricAllConcurrentExecutions" id="uv-python-lambda.PythonFunction.metricAllConcurrentExecutions"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.metricAllConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricAllConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllDuration` <a name="metricAllDuration" id="uv-python-lambda.PythonFunction.metricAllDuration"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.metricAllDuration(props?: MetricOptions)
```

Metric for the Duration executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricAllDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllErrors` <a name="metricAllErrors" id="uv-python-lambda.PythonFunction.metricAllErrors"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.metricAllErrors(props?: MetricOptions)
```

Metric for the number of Errors executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricAllErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllInvocations` <a name="metricAllInvocations" id="uv-python-lambda.PythonFunction.metricAllInvocations"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.metricAllInvocations(props?: MetricOptions)
```

Metric for the number of invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricAllInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllThrottles` <a name="metricAllThrottles" id="uv-python-lambda.PythonFunction.metricAllThrottles"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.metricAllThrottles(props?: MetricOptions)
```

Metric for the number of throttled invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricAllThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllUnreservedConcurrentExecutions` <a name="metricAllUnreservedConcurrentExecutions" id="uv-python-lambda.PythonFunction.metricAllUnreservedConcurrentExecutions"></a>

```typescript
import { PythonFunction } from 'uv-python-lambda'

PythonFunction.metricAllUnreservedConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of unreserved concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="uv-python-lambda.PythonFunction.metricAllUnreservedConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#uv-python-lambda.PythonFunction.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#uv-python-lambda.PythonFunction.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#uv-python-lambda.PythonFunction.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#uv-python-lambda.PythonFunction.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64). |
| <code><a href="#uv-python-lambda.PythonFunction.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | Access the Connections object. |
| <code><a href="#uv-python-lambda.PythonFunction.property.functionArn">functionArn</a></code> | <code>string</code> | ARN of this function. |
| <code><a href="#uv-python-lambda.PythonFunction.property.functionName">functionName</a></code> | <code>string</code> | Name of this function. |
| <code><a href="#uv-python-lambda.PythonFunction.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal this Lambda Function is running as. |
| <code><a href="#uv-python-lambda.PythonFunction.property.isBoundToVpc">isBoundToVpc</a></code> | <code>boolean</code> | Whether or not this Lambda function was bound to a VPC. |
| <code><a href="#uv-python-lambda.PythonFunction.property.latestVersion">latestVersion</a></code> | <code>aws-cdk-lib.aws_lambda.IVersion</code> | The `$LATEST` version of this function. |
| <code><a href="#uv-python-lambda.PythonFunction.property.permissionsNode">permissionsNode</a></code> | <code>constructs.Node</code> | The construct node where permissions are attached. |
| <code><a href="#uv-python-lambda.PythonFunction.property.resourceArnsForGrantInvoke">resourceArnsForGrantInvoke</a></code> | <code>string[]</code> | The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke(). |
| <code><a href="#uv-python-lambda.PythonFunction.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Execution role associated with this function. |
| <code><a href="#uv-python-lambda.PythonFunction.property.currentVersion">currentVersion</a></code> | <code>aws-cdk-lib.aws_lambda.Version</code> | Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes. |
| <code><a href="#uv-python-lambda.PythonFunction.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The LogGroup where the Lambda function's logs are made available. |
| <code><a href="#uv-python-lambda.PythonFunction.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime configured for this lambda. |
| <code><a href="#uv-python-lambda.PythonFunction.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The DLQ (as queue) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#uv-python-lambda.PythonFunction.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The DLQ (as topic) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#uv-python-lambda.PythonFunction.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout configured for this lambda. |

---

##### `node`<sup>Required</sup> <a name="node" id="uv-python-lambda.PythonFunction.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="uv-python-lambda.PythonFunction.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="uv-python-lambda.PythonFunction.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `architecture`<sup>Required</sup> <a name="architecture" id="uv-python-lambda.PythonFunction.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64).

---

##### `connections`<sup>Required</sup> <a name="connections" id="uv-python-lambda.PythonFunction.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

---

##### `functionArn`<sup>Required</sup> <a name="functionArn" id="uv-python-lambda.PythonFunction.property.functionArn"></a>

```typescript
public readonly functionArn: string;
```

- *Type:* string

ARN of this function.

---

##### `functionName`<sup>Required</sup> <a name="functionName" id="uv-python-lambda.PythonFunction.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string

Name of this function.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="uv-python-lambda.PythonFunction.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal this Lambda Function is running as.

---

##### `isBoundToVpc`<sup>Required</sup> <a name="isBoundToVpc" id="uv-python-lambda.PythonFunction.property.isBoundToVpc"></a>

```typescript
public readonly isBoundToVpc: boolean;
```

- *Type:* boolean

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

---

##### `latestVersion`<sup>Required</sup> <a name="latestVersion" id="uv-python-lambda.PythonFunction.property.latestVersion"></a>

```typescript
public readonly latestVersion: IVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.IVersion

The `$LATEST` version of this function.

Note that this is reference to a non-specific AWS Lambda version, which
means the function this version refers to can return different results in
different invocations.

To obtain a reference to an explicit version which references the current
function configuration, use `lambdaFunction.currentVersion` instead.

---

##### `permissionsNode`<sup>Required</sup> <a name="permissionsNode" id="uv-python-lambda.PythonFunction.property.permissionsNode"></a>

```typescript
public readonly permissionsNode: Node;
```

- *Type:* constructs.Node

The construct node where permissions are attached.

---

##### `resourceArnsForGrantInvoke`<sup>Required</sup> <a name="resourceArnsForGrantInvoke" id="uv-python-lambda.PythonFunction.property.resourceArnsForGrantInvoke"></a>

```typescript
public readonly resourceArnsForGrantInvoke: string[];
```

- *Type:* string[]

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

---

##### `role`<sup>Optional</sup> <a name="role" id="uv-python-lambda.PythonFunction.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Execution role associated with this function.

---

##### `currentVersion`<sup>Required</sup> <a name="currentVersion" id="uv-python-lambda.PythonFunction.property.currentVersion"></a>

```typescript
public readonly currentVersion: Version;
```

- *Type:* aws-cdk-lib.aws_lambda.Version

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions`
prop when initializing the `lambda.Function`.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="uv-python-lambda.PythonFunction.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The LogGroup where the Lambda function's logs are made available.

If either `logRetention` is set or this property is called, a CloudFormation custom resource is added to the stack that
pre-creates the log group as part of the stack deployment, if it already doesn't exist, and sets the correct log retention
period (never expire, by default).

Further, if the log group already exists and the `logRetention` is not set, the custom resource will reset the log retention
to never expire even if it was configured with a different value.

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="uv-python-lambda.PythonFunction.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime configured for this lambda.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="uv-python-lambda.PythonFunction.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="uv-python-lambda.PythonFunction.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="uv-python-lambda.PythonFunction.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

The timeout configured for this lambda.

---


## Structs <a name="Structs" id="Structs"></a>

### BundlingOptions <a name="BundlingOptions" id="uv-python-lambda.BundlingOptions"></a>

Options for bundling.

#### Initializer <a name="Initializer" id="uv-python-lambda.BundlingOptions.Initializer"></a>

```typescript
import { BundlingOptions } from 'uv-python-lambda'

const bundlingOptions: BundlingOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#uv-python-lambda.BundlingOptions.property.command">command</a></code> | <code>string[]</code> | The command to run in the container. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.entrypoint">entrypoint</a></code> | <code>string[]</code> | The entrypoint to run in the container. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | The environment variables to pass to the container. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.network">network</a></code> | <code>string</code> | Docker [Networking options](https://docs.docker.com/engine/reference/commandline/run/#connect-a-container-to-a-network---network). |
| <code><a href="#uv-python-lambda.BundlingOptions.property.platform">platform</a></code> | <code>string</code> | Set platform if server is multi-platform capable. _Requires Docker Engine API v1.38+_. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.securityOpt">securityOpt</a></code> | <code>string</code> | [Security configuration](https://docs.docker.com/engine/reference/run/#security-configuration) when running the docker container. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.user">user</a></code> | <code>string</code> | The user to use when running the container. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.volumes">volumes</a></code> | <code>aws-cdk-lib.DockerVolume[]</code> | Docker volumes to mount. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.volumesFrom">volumesFrom</a></code> | <code>string[]</code> | Where to mount the specified volumes from. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.workingDirectory">workingDirectory</a></code> | <code>string</code> | Working directory inside the container. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.assetExcludes">assetExcludes</a></code> | <code>string[]</code> | List of file patterns to exclude when copying assets from source for bundling. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.assetHash">assetHash</a></code> | <code>string</code> | Specify a custom hash for this asset. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.assetHashType">assetHashType</a></code> | <code>aws-cdk-lib.AssetHashType</code> | Determines how asset hash is calculated. Assets will get rebuild and uploaded only if their hash has changed. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.buildArgs">buildArgs</a></code> | <code>{[ key: string ]: string}</code> | Optional build arguments to pass to the default container. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.bundlingFileAccess">bundlingFileAccess</a></code> | <code>aws-cdk-lib.BundlingFileAccess</code> | Which option to use to copy the source files to the docker container and output files back. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.commandHooks">commandHooks</a></code> | <code><a href="#uv-python-lambda.ICommandHooks">ICommandHooks</a></code> | Command hooks. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.image">image</a></code> | <code>aws-cdk-lib.DockerImage</code> | Docker image to use for bundling. |
| <code><a href="#uv-python-lambda.BundlingOptions.property.outputPathSuffix">outputPathSuffix</a></code> | <code>string</code> | Output path suffix: the suffix for the directory into which the bundled output is written. |

---

##### `command`<sup>Optional</sup> <a name="command" id="uv-python-lambda.BundlingOptions.property.command"></a>

```typescript
public readonly command: string[];
```

- *Type:* string[]
- *Default:* run the command defined in the image

The command to run in the container.

---

##### `entrypoint`<sup>Optional</sup> <a name="entrypoint" id="uv-python-lambda.BundlingOptions.property.entrypoint"></a>

```typescript
public readonly entrypoint: string[];
```

- *Type:* string[]
- *Default:* run the entrypoint defined in the image

The entrypoint to run in the container.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="uv-python-lambda.BundlingOptions.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no environment variables.

The environment variables to pass to the container.

---

##### `network`<sup>Optional</sup> <a name="network" id="uv-python-lambda.BundlingOptions.property.network"></a>

```typescript
public readonly network: string;
```

- *Type:* string
- *Default:* no networking options

Docker [Networking options](https://docs.docker.com/engine/reference/commandline/run/#connect-a-container-to-a-network---network).

---

##### `platform`<sup>Optional</sup> <a name="platform" id="uv-python-lambda.BundlingOptions.property.platform"></a>

```typescript
public readonly platform: string;
```

- *Type:* string
- *Default:* no platform specified

Set platform if server is multi-platform capable. _Requires Docker Engine API v1.38+_.

Example value: `linux/amd64`

---

##### `securityOpt`<sup>Optional</sup> <a name="securityOpt" id="uv-python-lambda.BundlingOptions.property.securityOpt"></a>

```typescript
public readonly securityOpt: string;
```

- *Type:* string
- *Default:* no security options

[Security configuration](https://docs.docker.com/engine/reference/run/#security-configuration) when running the docker container.

---

##### `user`<sup>Optional</sup> <a name="user" id="uv-python-lambda.BundlingOptions.property.user"></a>

```typescript
public readonly user: string;
```

- *Type:* string
- *Default:* root or image default

The user to use when running the container.

---

##### `volumes`<sup>Optional</sup> <a name="volumes" id="uv-python-lambda.BundlingOptions.property.volumes"></a>

```typescript
public readonly volumes: DockerVolume[];
```

- *Type:* aws-cdk-lib.DockerVolume[]
- *Default:* no volumes are mounted

Docker volumes to mount.

---

##### `volumesFrom`<sup>Optional</sup> <a name="volumesFrom" id="uv-python-lambda.BundlingOptions.property.volumesFrom"></a>

```typescript
public readonly volumesFrom: string[];
```

- *Type:* string[]
- *Default:* no containers are specified to mount volumes from

Where to mount the specified volumes from.

> [https://docs.docker.com/engine/reference/commandline/run/#mount-volumes-from-container---volumes-from](https://docs.docker.com/engine/reference/commandline/run/#mount-volumes-from-container---volumes-from)

---

##### `workingDirectory`<sup>Optional</sup> <a name="workingDirectory" id="uv-python-lambda.BundlingOptions.property.workingDirectory"></a>

```typescript
public readonly workingDirectory: string;
```

- *Type:* string
- *Default:* image default

Working directory inside the container.

---

##### `assetExcludes`<sup>Optional</sup> <a name="assetExcludes" id="uv-python-lambda.BundlingOptions.property.assetExcludes"></a>

```typescript
public readonly assetExcludes: string[];
```

- *Type:* string[]
- *Default:* DEFAULT_ASSET_EXCLUDES

List of file patterns to exclude when copying assets from source for bundling.

---

##### `assetHash`<sup>Optional</sup> <a name="assetHash" id="uv-python-lambda.BundlingOptions.property.assetHash"></a>

```typescript
public readonly assetHash: string;
```

- *Type:* string
- *Default:* Based on `assetHashType`

Specify a custom hash for this asset.

If `assetHashType` is set it must
be set to `AssetHashType.CUSTOM`. For consistency, this custom hash will
be SHA256 hashed and encoded as hex. The resulting hash will be the asset
hash.

NOTE: the hash is used in order to identify a specific revision of the asset, and
used for optimizing and caching deployment activities related to this asset such as
packaging, uploading to Amazon S3, etc. If you chose to customize the hash, you will
need to make sure it is updated every time the asset changes, or otherwise it is
possible that some deployments will not be invalidated.

---

##### `assetHashType`<sup>Optional</sup> <a name="assetHashType" id="uv-python-lambda.BundlingOptions.property.assetHashType"></a>

```typescript
public readonly assetHashType: AssetHashType;
```

- *Type:* aws-cdk-lib.AssetHashType
- *Default:* AssetHashType.SOURCE By default, hash is calculated based on the contents of the source directory. This means that only updates to the source will cause the asset to rebuild.

Determines how asset hash is calculated. Assets will get rebuild and uploaded only if their hash has changed.

If asset hash is set to `SOURCE` (default), then only changes to the source
directory will cause the asset to rebuild. This means, for example, that in
order to pick up a new dependency version, a change must be made to the
source tree. Ideally, this can be implemented by including a dependency
lockfile in your source tree or using fixed dependencies.

If the asset hash is set to `OUTPUT`, the hash is calculated after
bundling. This means that any change in the output will cause the asset to
be invalidated and uploaded. Bear in mind that `pip` adds timestamps to
dependencies it installs, which implies that in this mode Python bundles
will _always_ get rebuild and uploaded. Normally this is an anti-pattern
since build

---

##### `buildArgs`<sup>Optional</sup> <a name="buildArgs" id="uv-python-lambda.BundlingOptions.property.buildArgs"></a>

```typescript
public readonly buildArgs: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No build arguments.

Optional build arguments to pass to the default container.

This can be used to customize
the index URLs used for installing dependencies.
This is not used if a custom image is provided.

---

##### `bundlingFileAccess`<sup>Optional</sup> <a name="bundlingFileAccess" id="uv-python-lambda.BundlingOptions.property.bundlingFileAccess"></a>

```typescript
public readonly bundlingFileAccess: BundlingFileAccess;
```

- *Type:* aws-cdk-lib.BundlingFileAccess
- *Default:* BundlingFileAccess.BIND_MOUNT

Which option to use to copy the source files to the docker container and output files back.

---

##### `commandHooks`<sup>Optional</sup> <a name="commandHooks" id="uv-python-lambda.BundlingOptions.property.commandHooks"></a>

```typescript
public readonly commandHooks: ICommandHooks;
```

- *Type:* <a href="#uv-python-lambda.ICommandHooks">ICommandHooks</a>
- *Default:* do not run additional commands

Command hooks.

---

##### `image`<sup>Optional</sup> <a name="image" id="uv-python-lambda.BundlingOptions.property.image"></a>

```typescript
public readonly image: DockerImage;
```

- *Type:* aws-cdk-lib.DockerImage
- *Default:* Default bundling image.

Docker image to use for bundling.

If no options are provided, the default bundling image
will be used. Dependencies will be installed using the default packaging commands
and copied over from into the Lambda asset.

---

##### `outputPathSuffix`<sup>Optional</sup> <a name="outputPathSuffix" id="uv-python-lambda.BundlingOptions.property.outputPathSuffix"></a>

```typescript
public readonly outputPathSuffix: string;
```

- *Type:* string
- *Default:* 'python' for a layer, empty string otherwise.

Output path suffix: the suffix for the directory into which the bundled output is written.

---

### BundlingProps <a name="BundlingProps" id="uv-python-lambda.BundlingProps"></a>

#### Initializer <a name="Initializer" id="uv-python-lambda.BundlingProps.Initializer"></a>

```typescript
import { BundlingProps } from 'uv-python-lambda'

const bundlingProps: BundlingProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#uv-python-lambda.BundlingProps.property.command">command</a></code> | <code>string[]</code> | The command to run in the container. |
| <code><a href="#uv-python-lambda.BundlingProps.property.entrypoint">entrypoint</a></code> | <code>string[]</code> | The entrypoint to run in the container. |
| <code><a href="#uv-python-lambda.BundlingProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | The environment variables to pass to the container. |
| <code><a href="#uv-python-lambda.BundlingProps.property.network">network</a></code> | <code>string</code> | Docker [Networking options](https://docs.docker.com/engine/reference/commandline/run/#connect-a-container-to-a-network---network). |
| <code><a href="#uv-python-lambda.BundlingProps.property.platform">platform</a></code> | <code>string</code> | Set platform if server is multi-platform capable. _Requires Docker Engine API v1.38+_. |
| <code><a href="#uv-python-lambda.BundlingProps.property.securityOpt">securityOpt</a></code> | <code>string</code> | [Security configuration](https://docs.docker.com/engine/reference/run/#security-configuration) when running the docker container. |
| <code><a href="#uv-python-lambda.BundlingProps.property.user">user</a></code> | <code>string</code> | The user to use when running the container. |
| <code><a href="#uv-python-lambda.BundlingProps.property.volumes">volumes</a></code> | <code>aws-cdk-lib.DockerVolume[]</code> | Docker volumes to mount. |
| <code><a href="#uv-python-lambda.BundlingProps.property.volumesFrom">volumesFrom</a></code> | <code>string[]</code> | Where to mount the specified volumes from. |
| <code><a href="#uv-python-lambda.BundlingProps.property.workingDirectory">workingDirectory</a></code> | <code>string</code> | Working directory inside the container. |
| <code><a href="#uv-python-lambda.BundlingProps.property.assetExcludes">assetExcludes</a></code> | <code>string[]</code> | List of file patterns to exclude when copying assets from source for bundling. |
| <code><a href="#uv-python-lambda.BundlingProps.property.assetHash">assetHash</a></code> | <code>string</code> | Specify a custom hash for this asset. |
| <code><a href="#uv-python-lambda.BundlingProps.property.assetHashType">assetHashType</a></code> | <code>aws-cdk-lib.AssetHashType</code> | Determines how asset hash is calculated. Assets will get rebuild and uploaded only if their hash has changed. |
| <code><a href="#uv-python-lambda.BundlingProps.property.buildArgs">buildArgs</a></code> | <code>{[ key: string ]: string}</code> | Optional build arguments to pass to the default container. |
| <code><a href="#uv-python-lambda.BundlingProps.property.bundlingFileAccess">bundlingFileAccess</a></code> | <code>aws-cdk-lib.BundlingFileAccess</code> | Which option to use to copy the source files to the docker container and output files back. |
| <code><a href="#uv-python-lambda.BundlingProps.property.commandHooks">commandHooks</a></code> | <code><a href="#uv-python-lambda.ICommandHooks">ICommandHooks</a></code> | Command hooks. |
| <code><a href="#uv-python-lambda.BundlingProps.property.image">image</a></code> | <code>aws-cdk-lib.DockerImage</code> | Docker image to use for bundling. |
| <code><a href="#uv-python-lambda.BundlingProps.property.outputPathSuffix">outputPathSuffix</a></code> | <code>string</code> | Output path suffix: the suffix for the directory into which the bundled output is written. |
| <code><a href="#uv-python-lambda.BundlingProps.property.rootDir">rootDir</a></code> | <code>string</code> | uv project root (workspace root). |
| <code><a href="#uv-python-lambda.BundlingProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | Lambda runtime (must be one of the Python runtimes). |
| <code><a href="#uv-python-lambda.BundlingProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | Lambda CPU architecture. |
| <code><a href="#uv-python-lambda.BundlingProps.property.skip">skip</a></code> | <code>boolean</code> | Skip bundling process. |
| <code><a href="#uv-python-lambda.BundlingProps.property.workspacePackage">workspacePackage</a></code> | <code>string</code> | uv package to use for the Lambda Function. |

---

##### `command`<sup>Optional</sup> <a name="command" id="uv-python-lambda.BundlingProps.property.command"></a>

```typescript
public readonly command: string[];
```

- *Type:* string[]
- *Default:* run the command defined in the image

The command to run in the container.

---

##### `entrypoint`<sup>Optional</sup> <a name="entrypoint" id="uv-python-lambda.BundlingProps.property.entrypoint"></a>

```typescript
public readonly entrypoint: string[];
```

- *Type:* string[]
- *Default:* run the entrypoint defined in the image

The entrypoint to run in the container.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="uv-python-lambda.BundlingProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no environment variables.

The environment variables to pass to the container.

---

##### `network`<sup>Optional</sup> <a name="network" id="uv-python-lambda.BundlingProps.property.network"></a>

```typescript
public readonly network: string;
```

- *Type:* string
- *Default:* no networking options

Docker [Networking options](https://docs.docker.com/engine/reference/commandline/run/#connect-a-container-to-a-network---network).

---

##### `platform`<sup>Optional</sup> <a name="platform" id="uv-python-lambda.BundlingProps.property.platform"></a>

```typescript
public readonly platform: string;
```

- *Type:* string
- *Default:* no platform specified

Set platform if server is multi-platform capable. _Requires Docker Engine API v1.38+_.

Example value: `linux/amd64`

---

##### `securityOpt`<sup>Optional</sup> <a name="securityOpt" id="uv-python-lambda.BundlingProps.property.securityOpt"></a>

```typescript
public readonly securityOpt: string;
```

- *Type:* string
- *Default:* no security options

[Security configuration](https://docs.docker.com/engine/reference/run/#security-configuration) when running the docker container.

---

##### `user`<sup>Optional</sup> <a name="user" id="uv-python-lambda.BundlingProps.property.user"></a>

```typescript
public readonly user: string;
```

- *Type:* string
- *Default:* root or image default

The user to use when running the container.

---

##### `volumes`<sup>Optional</sup> <a name="volumes" id="uv-python-lambda.BundlingProps.property.volumes"></a>

```typescript
public readonly volumes: DockerVolume[];
```

- *Type:* aws-cdk-lib.DockerVolume[]
- *Default:* no volumes are mounted

Docker volumes to mount.

---

##### `volumesFrom`<sup>Optional</sup> <a name="volumesFrom" id="uv-python-lambda.BundlingProps.property.volumesFrom"></a>

```typescript
public readonly volumesFrom: string[];
```

- *Type:* string[]
- *Default:* no containers are specified to mount volumes from

Where to mount the specified volumes from.

> [https://docs.docker.com/engine/reference/commandline/run/#mount-volumes-from-container---volumes-from](https://docs.docker.com/engine/reference/commandline/run/#mount-volumes-from-container---volumes-from)

---

##### `workingDirectory`<sup>Optional</sup> <a name="workingDirectory" id="uv-python-lambda.BundlingProps.property.workingDirectory"></a>

```typescript
public readonly workingDirectory: string;
```

- *Type:* string
- *Default:* image default

Working directory inside the container.

---

##### `assetExcludes`<sup>Optional</sup> <a name="assetExcludes" id="uv-python-lambda.BundlingProps.property.assetExcludes"></a>

```typescript
public readonly assetExcludes: string[];
```

- *Type:* string[]
- *Default:* DEFAULT_ASSET_EXCLUDES

List of file patterns to exclude when copying assets from source for bundling.

---

##### `assetHash`<sup>Optional</sup> <a name="assetHash" id="uv-python-lambda.BundlingProps.property.assetHash"></a>

```typescript
public readonly assetHash: string;
```

- *Type:* string
- *Default:* Based on `assetHashType`

Specify a custom hash for this asset.

If `assetHashType` is set it must
be set to `AssetHashType.CUSTOM`. For consistency, this custom hash will
be SHA256 hashed and encoded as hex. The resulting hash will be the asset
hash.

NOTE: the hash is used in order to identify a specific revision of the asset, and
used for optimizing and caching deployment activities related to this asset such as
packaging, uploading to Amazon S3, etc. If you chose to customize the hash, you will
need to make sure it is updated every time the asset changes, or otherwise it is
possible that some deployments will not be invalidated.

---

##### `assetHashType`<sup>Optional</sup> <a name="assetHashType" id="uv-python-lambda.BundlingProps.property.assetHashType"></a>

```typescript
public readonly assetHashType: AssetHashType;
```

- *Type:* aws-cdk-lib.AssetHashType
- *Default:* AssetHashType.SOURCE By default, hash is calculated based on the contents of the source directory. This means that only updates to the source will cause the asset to rebuild.

Determines how asset hash is calculated. Assets will get rebuild and uploaded only if their hash has changed.

If asset hash is set to `SOURCE` (default), then only changes to the source
directory will cause the asset to rebuild. This means, for example, that in
order to pick up a new dependency version, a change must be made to the
source tree. Ideally, this can be implemented by including a dependency
lockfile in your source tree or using fixed dependencies.

If the asset hash is set to `OUTPUT`, the hash is calculated after
bundling. This means that any change in the output will cause the asset to
be invalidated and uploaded. Bear in mind that `pip` adds timestamps to
dependencies it installs, which implies that in this mode Python bundles
will _always_ get rebuild and uploaded. Normally this is an anti-pattern
since build

---

##### `buildArgs`<sup>Optional</sup> <a name="buildArgs" id="uv-python-lambda.BundlingProps.property.buildArgs"></a>

```typescript
public readonly buildArgs: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No build arguments.

Optional build arguments to pass to the default container.

This can be used to customize
the index URLs used for installing dependencies.
This is not used if a custom image is provided.

---

##### `bundlingFileAccess`<sup>Optional</sup> <a name="bundlingFileAccess" id="uv-python-lambda.BundlingProps.property.bundlingFileAccess"></a>

```typescript
public readonly bundlingFileAccess: BundlingFileAccess;
```

- *Type:* aws-cdk-lib.BundlingFileAccess
- *Default:* BundlingFileAccess.BIND_MOUNT

Which option to use to copy the source files to the docker container and output files back.

---

##### `commandHooks`<sup>Optional</sup> <a name="commandHooks" id="uv-python-lambda.BundlingProps.property.commandHooks"></a>

```typescript
public readonly commandHooks: ICommandHooks;
```

- *Type:* <a href="#uv-python-lambda.ICommandHooks">ICommandHooks</a>
- *Default:* do not run additional commands

Command hooks.

---

##### `image`<sup>Optional</sup> <a name="image" id="uv-python-lambda.BundlingProps.property.image"></a>

```typescript
public readonly image: DockerImage;
```

- *Type:* aws-cdk-lib.DockerImage
- *Default:* Default bundling image.

Docker image to use for bundling.

If no options are provided, the default bundling image
will be used. Dependencies will be installed using the default packaging commands
and copied over from into the Lambda asset.

---

##### `outputPathSuffix`<sup>Optional</sup> <a name="outputPathSuffix" id="uv-python-lambda.BundlingProps.property.outputPathSuffix"></a>

```typescript
public readonly outputPathSuffix: string;
```

- *Type:* string
- *Default:* 'python' for a layer, empty string otherwise.

Output path suffix: the suffix for the directory into which the bundled output is written.

---

##### `rootDir`<sup>Required</sup> <a name="rootDir" id="uv-python-lambda.BundlingProps.property.rootDir"></a>

```typescript
public readonly rootDir: string;
```

- *Type:* string

uv project root (workspace root).

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="uv-python-lambda.BundlingProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

Lambda runtime (must be one of the Python runtimes).

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="uv-python-lambda.BundlingProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.ARM_64

Lambda CPU architecture.

---

##### `skip`<sup>Optional</sup> <a name="skip" id="uv-python-lambda.BundlingProps.property.skip"></a>

```typescript
public readonly skip: boolean;
```

- *Type:* boolean
- *Default:* false

Skip bundling process.

---

##### `workspacePackage`<sup>Optional</sup> <a name="workspacePackage" id="uv-python-lambda.BundlingProps.property.workspacePackage"></a>

```typescript
public readonly workspacePackage: string;
```

- *Type:* string

uv package to use for the Lambda Function.

---

### PythonFunctionProps <a name="PythonFunctionProps" id="uv-python-lambda.PythonFunctionProps"></a>

#### Initializer <a name="Initializer" id="uv-python-lambda.PythonFunctionProps.Initializer"></a>

```typescript
import { PythonFunctionProps } from 'uv-python-lambda'

const pythonFunctionProps: PythonFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.allowAllIpv6Outbound">allowAllIpv6Outbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all ipv6 network traffic. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.allowAllOutbound">allowAllOutbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all network traffic (except ipv6). |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.allowPublicSubnet">allowPublicSubnet</a></code> | <code>boolean</code> | Lambda Functions in a public subnet can NOT access the internet. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.applicationLogLevelV2">applicationLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.ApplicationLogLevel</code> | Sets the application log level for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Key-value pairs that Lambda caches and makes available for your Lambda functions. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.filesystem">filesystem</a></code> | <code>aws-cdk-lib.aws_lambda.FileSystem</code> | The filesystem configuration for the lambda function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.ipv6AllowedForDualStack">ipv6AllowedForDualStack</a></code> | <code>boolean</code> | Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.layers">layers</a></code> | <code>aws-cdk-lib.aws_lambda.ILayerVersion[]</code> | A list of layers to add to the function's execution environment. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.loggingFormat">loggingFormat</a></code> | <code>aws-cdk-lib.aws_lambda.LoggingFormat</code> | Sets the loggingFormat for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group the function sends logs to. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.memorySize">memorySize</a></code> | <code>number</code> | The amount of memory, in MB, that is allocated to your Lambda function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.recursiveLoop">recursiveLoop</a></code> | <code>aws-cdk-lib.aws_lambda.RecursiveLoop</code> | Sets the Recursive Loop Protection for Lambda Function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.systemLogLevelV2">systemLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.SystemLogLevel</code> | Sets the system log level for the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The function execution time (in seconds) after which Lambda terminates the function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.rootDir">rootDir</a></code> | <code>string</code> | UV project root directory (workspace root). |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.bundling">bundling</a></code> | <code><a href="#uv-python-lambda.BundlingOptions">BundlingOptions</a></code> | Custom bundling options, including build architecture and bundling container image. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.handler">handler</a></code> | <code>string</code> | The name of the exported handler function in the #index. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.index">index</a></code> | <code>string</code> | The path to the index file with the project or (or workspace, if specified) containing the handler. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime. |
| <code><a href="#uv-python-lambda.PythonFunctionProps.property.workspacePackage">workspacePackage</a></code> | <code>string</code> | Optional UV project workspace, used to specify a specific package to be used as a Lambda Function entry. |

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="uv-python-lambda.PythonFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="uv-python-lambda.PythonFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="uv-python-lambda.PythonFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="uv-python-lambda.PythonFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="uv-python-lambda.PythonFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

> [https://aws-otel.github.io/docs/getting-started/lambda](https://aws-otel.github.io/docs/getting-started/lambda)

---

##### `allowAllIpv6Outbound`<sup>Optional</sup> <a name="allowAllIpv6Outbound" id="uv-python-lambda.PythonFunctionProps.property.allowAllIpv6Outbound"></a>

```typescript
public readonly allowAllIpv6Outbound: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to allow the Lambda to send all ipv6 network traffic.

If set to true, there will only be a single egress rule which allows all
outbound ipv6 traffic. If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets using ipv6.

Do not specify this property if the `securityGroups` or `securityGroup` property is set.
Instead, configure `allowAllIpv6Outbound` directly on the security group.

---

##### `allowAllOutbound`<sup>Optional</sup> <a name="allowAllOutbound" id="uv-python-lambda.PythonFunctionProps.property.allowAllOutbound"></a>

```typescript
public readonly allowAllOutbound: boolean;
```

- *Type:* boolean
- *Default:* true

Whether to allow the Lambda to send all network traffic (except ipv6).

If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets.

Do not specify this property if the `securityGroups` or `securityGroup` property is set.
Instead, configure `allowAllOutbound` directly on the security group.

---

##### `allowPublicSubnet`<sup>Optional</sup> <a name="allowPublicSubnet" id="uv-python-lambda.PythonFunctionProps.property.allowPublicSubnet"></a>

```typescript
public readonly allowPublicSubnet: boolean;
```

- *Type:* boolean
- *Default:* false

Lambda Functions in a public subnet can NOT access the internet.

Use this property to acknowledge this limitation and still place the function in a public subnet.

> [https://stackoverflow.com/questions/52992085/why-cant-an-aws-lambda-function-inside-a-public-subnet-in-a-vpc-connect-to-the/52994841#52994841](https://stackoverflow.com/questions/52992085/why-cant-an-aws-lambda-function-inside-a-public-subnet-in-a-vpc-connect-to-the/52994841#52994841)

---

##### ~~`applicationLogLevel`~~<sup>Optional</sup> <a name="applicationLogLevel" id="uv-python-lambda.PythonFunctionProps.property.applicationLogLevel"></a>

- *Deprecated:* Use `applicationLogLevelV2` as a property instead.

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the application log level for the function.

---

##### `applicationLogLevelV2`<sup>Optional</sup> <a name="applicationLogLevelV2" id="uv-python-lambda.PythonFunctionProps.property.applicationLogLevelV2"></a>

```typescript
public readonly applicationLogLevelV2: ApplicationLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.ApplicationLogLevel
- *Default:* ApplicationLogLevel.INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="uv-python-lambda.PythonFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="uv-python-lambda.PythonFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="uv-python-lambda.PythonFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="uv-python-lambda.PythonFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="uv-python-lambda.PythonFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="uv-python-lambda.PythonFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="uv-python-lambda.PythonFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="uv-python-lambda.PythonFunctionProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No environment variables.

Key-value pairs that Lambda caches and makes available for your Lambda functions.

Use environment variables to apply configuration changes, such
as test and production environment configurations, without changing your
Lambda function source code.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="uv-python-lambda.PythonFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="uv-python-lambda.PythonFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="uv-python-lambda.PythonFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `filesystem`<sup>Optional</sup> <a name="filesystem" id="uv-python-lambda.PythonFunctionProps.property.filesystem"></a>

```typescript
public readonly filesystem: FileSystem;
```

- *Type:* aws-cdk-lib.aws_lambda.FileSystem
- *Default:* will not mount any filesystem

The filesystem configuration for the lambda function.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="uv-python-lambda.PythonFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="uv-python-lambda.PythonFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="uv-python-lambda.PythonFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

> [https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-Getting-Started-docker.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-Getting-Started-docker.html)

---

##### `ipv6AllowedForDualStack`<sup>Optional</sup> <a name="ipv6AllowedForDualStack" id="uv-python-lambda.PythonFunctionProps.property.ipv6AllowedForDualStack"></a>

```typescript
public readonly ipv6AllowedForDualStack: boolean;
```

- *Type:* boolean
- *Default:* false

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

Only used if 'vpc' is supplied.

---

##### `layers`<sup>Optional</sup> <a name="layers" id="uv-python-lambda.PythonFunctionProps.property.layers"></a>

```typescript
public readonly layers: ILayerVersion[];
```

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion[]
- *Default:* No layers.

A list of layers to add to the function's execution environment.

You can configure your Lambda function to pull in
additional code during initialization in the form of layers. Layers are packages of libraries or other dependencies
that can be used by multiple functions.

---

##### ~~`logFormat`~~<sup>Optional</sup> <a name="logFormat" id="uv-python-lambda.PythonFunctionProps.property.logFormat"></a>

- *Deprecated:* Use `loggingFormat` as a property instead.

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* "Text"

Sets the logFormat for the function.

---

##### `loggingFormat`<sup>Optional</sup> <a name="loggingFormat" id="uv-python-lambda.PythonFunctionProps.property.loggingFormat"></a>

```typescript
public readonly loggingFormat: LoggingFormat;
```

- *Type:* aws-cdk-lib.aws_lambda.LoggingFormat
- *Default:* LoggingFormat.TEXT

Sets the loggingFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="uv-python-lambda.PythonFunctionProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` - default log group created by Lambda

The log group the function sends logs to.

By default, Lambda functions send logs to an automatically created default log group named /aws/lambda/\<function name\>.
However you cannot change the properties of this auto-created log group using the AWS CDK, e.g. you cannot set a different log retention.

Use the `logGroup` property to create a fully customizable LogGroup ahead of time, and instruct the Lambda function to send logs to it.

Providing a user-controlled log group was rolled out to commercial regions on 2023-11-16.
If you are deploying to another type of region, please check regional availability first.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="uv-python-lambda.PythonFunctionProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

This is a legacy API and we strongly recommend you move away from it if you can.
Instead create a fully customizable log group with `logs.LogGroup` and use the `logGroup` property
to instruct the Lambda function to send logs to it.
Migrating from `logRetention` to `logGroup` will cause the name of the log group to change.
Users and code and referencing the name verbatim will have to adjust.

In AWS CDK code, you can access the log group name directly from the LogGroup construct:
```ts
import * as logs from 'aws-cdk-lib/aws-logs';

declare const myLogGroup: logs.LogGroup;
myLogGroup.logGroupName;
```

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="uv-python-lambda.PythonFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="uv-python-lambda.PythonFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="uv-python-lambda.PythonFunctionProps.property.memorySize"></a>

```typescript
public readonly memorySize: number;
```

- *Type:* number
- *Default:* 128

The amount of memory, in MB, that is allocated to your Lambda function.

Lambda uses this value to proportionally allocate the amount of CPU
power. For more information, see Resource Model in the AWS Lambda
Developer Guide.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="uv-python-lambda.PythonFunctionProps.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

> [https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html)

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="uv-python-lambda.PythonFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

> [https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html](https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html)

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="uv-python-lambda.PythonFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

> [https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html](https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html)

---

##### `recursiveLoop`<sup>Optional</sup> <a name="recursiveLoop" id="uv-python-lambda.PythonFunctionProps.property.recursiveLoop"></a>

```typescript
public readonly recursiveLoop: RecursiveLoop;
```

- *Type:* aws-cdk-lib.aws_lambda.RecursiveLoop
- *Default:* RecursiveLoop.Terminate

Sets the Recursive Loop Protection for Lambda Function.

It lets Lambda detect and terminate unintended recusrive loops.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="uv-python-lambda.PythonFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

> [https://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html](https://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html)

---

##### `role`<sup>Optional</sup> <a name="role" id="uv-python-lambda.PythonFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="uv-python-lambda.PythonFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="uv-python-lambda.PythonFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="uv-python-lambda.PythonFunctionProps.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported only for Java 11, 17 runtime

---

##### ~~`systemLogLevel`~~<sup>Optional</sup> <a name="systemLogLevel" id="uv-python-lambda.PythonFunctionProps.property.systemLogLevel"></a>

- *Deprecated:* Use `systemLogLevelV2` as a property instead.

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the system log level for the function.

---

##### `systemLogLevelV2`<sup>Optional</sup> <a name="systemLogLevelV2" id="uv-python-lambda.PythonFunctionProps.property.systemLogLevelV2"></a>

```typescript
public readonly systemLogLevelV2: SystemLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.SystemLogLevel
- *Default:* SystemLogLevel.INFO

Sets the system log level for the function.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="uv-python-lambda.PythonFunctionProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.seconds(3)

The function execution time (in seconds) after which Lambda terminates the function.

Because the execution time affects cost, set this value
based on the function's expected execution time.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="uv-python-lambda.PythonFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="uv-python-lambda.PythonFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="uv-python-lambda.PythonFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

##### `rootDir`<sup>Required</sup> <a name="rootDir" id="uv-python-lambda.PythonFunctionProps.property.rootDir"></a>

```typescript
public readonly rootDir: string;
```

- *Type:* string

UV project root directory (workspace root).

---

##### `bundling`<sup>Optional</sup> <a name="bundling" id="uv-python-lambda.PythonFunctionProps.property.bundling"></a>

```typescript
public readonly bundling: BundlingOptions;
```

- *Type:* <a href="#uv-python-lambda.BundlingOptions">BundlingOptions</a>

Custom bundling options, including build architecture and bundling container image.

---

##### `handler`<sup>Optional</sup> <a name="handler" id="uv-python-lambda.PythonFunctionProps.property.handler"></a>

```typescript
public readonly handler: string;
```

- *Type:* string
- *Default:* handler

The name of the exported handler function in the #index.

---

##### `index`<sup>Optional</sup> <a name="index" id="uv-python-lambda.PythonFunctionProps.property.index"></a>

```typescript
public readonly index: string;
```

- *Type:* string
- *Default:* index.py

The path to the index file with the project or (or workspace, if specified) containing the handler.

---

##### `runtime`<sup>Optional</sup> <a name="runtime" id="uv-python-lambda.PythonFunctionProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime
- *Default:* Runtime.PYTHON_3_12

The runtime.

---

##### `workspacePackage`<sup>Optional</sup> <a name="workspacePackage" id="uv-python-lambda.PythonFunctionProps.property.workspacePackage"></a>

```typescript
public readonly workspacePackage: string;
```

- *Type:* string

Optional UV project workspace, used to specify a specific package to be used as a Lambda Function entry.

---

## Classes <a name="Classes" id="Classes"></a>

### Bundling <a name="Bundling" id="uv-python-lambda.Bundling"></a>

Bundling options for Python Lambda assets.

#### Initializers <a name="Initializers" id="uv-python-lambda.Bundling.Initializer"></a>

```typescript
import { Bundling } from 'uv-python-lambda'

new Bundling(props: BundlingProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#uv-python-lambda.Bundling.Initializer.parameter.props">props</a></code> | <code><a href="#uv-python-lambda.BundlingProps">BundlingProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="uv-python-lambda.Bundling.Initializer.parameter.props"></a>

- *Type:* <a href="#uv-python-lambda.BundlingProps">BundlingProps</a>

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#uv-python-lambda.Bundling.bundle">bundle</a></code> | *No description.* |

---

##### `bundle` <a name="bundle" id="uv-python-lambda.Bundling.bundle"></a>

```typescript
import { Bundling } from 'uv-python-lambda'

Bundling.bundle(options: BundlingProps)
```

###### `options`<sup>Required</sup> <a name="options" id="uv-python-lambda.Bundling.bundle.parameter.options"></a>

- *Type:* <a href="#uv-python-lambda.BundlingProps">BundlingProps</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#uv-python-lambda.Bundling.property.image">image</a></code> | <code>aws-cdk-lib.DockerImage</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.bundlingFileAccess">bundlingFileAccess</a></code> | <code>aws-cdk-lib.BundlingFileAccess</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.command">command</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.entrypoint">entrypoint</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.network">network</a></code> | <code>string</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.securityOpt">securityOpt</a></code> | <code>string</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.user">user</a></code> | <code>string</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.volumes">volumes</a></code> | <code>aws-cdk-lib.DockerVolume[]</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.volumesFrom">volumesFrom</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#uv-python-lambda.Bundling.property.workingDirectory">workingDirectory</a></code> | <code>string</code> | *No description.* |

---

##### `image`<sup>Required</sup> <a name="image" id="uv-python-lambda.Bundling.property.image"></a>

```typescript
public readonly image: DockerImage;
```

- *Type:* aws-cdk-lib.DockerImage

---

##### `bundlingFileAccess`<sup>Optional</sup> <a name="bundlingFileAccess" id="uv-python-lambda.Bundling.property.bundlingFileAccess"></a>

```typescript
public readonly bundlingFileAccess: BundlingFileAccess;
```

- *Type:* aws-cdk-lib.BundlingFileAccess

---

##### `command`<sup>Optional</sup> <a name="command" id="uv-python-lambda.Bundling.property.command"></a>

```typescript
public readonly command: string[];
```

- *Type:* string[]

---

##### `entrypoint`<sup>Optional</sup> <a name="entrypoint" id="uv-python-lambda.Bundling.property.entrypoint"></a>

```typescript
public readonly entrypoint: string[];
```

- *Type:* string[]

---

##### `environment`<sup>Optional</sup> <a name="environment" id="uv-python-lambda.Bundling.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `network`<sup>Optional</sup> <a name="network" id="uv-python-lambda.Bundling.property.network"></a>

```typescript
public readonly network: string;
```

- *Type:* string

---

##### `securityOpt`<sup>Optional</sup> <a name="securityOpt" id="uv-python-lambda.Bundling.property.securityOpt"></a>

```typescript
public readonly securityOpt: string;
```

- *Type:* string

---

##### `user`<sup>Optional</sup> <a name="user" id="uv-python-lambda.Bundling.property.user"></a>

```typescript
public readonly user: string;
```

- *Type:* string

---

##### `volumes`<sup>Optional</sup> <a name="volumes" id="uv-python-lambda.Bundling.property.volumes"></a>

```typescript
public readonly volumes: DockerVolume[];
```

- *Type:* aws-cdk-lib.DockerVolume[]

---

##### `volumesFrom`<sup>Optional</sup> <a name="volumesFrom" id="uv-python-lambda.Bundling.property.volumesFrom"></a>

```typescript
public readonly volumesFrom: string[];
```

- *Type:* string[]

---

##### `workingDirectory`<sup>Optional</sup> <a name="workingDirectory" id="uv-python-lambda.Bundling.property.workingDirectory"></a>

```typescript
public readonly workingDirectory: string;
```

- *Type:* string

---


## Protocols <a name="Protocols" id="Protocols"></a>

### ICommandHooks <a name="ICommandHooks" id="uv-python-lambda.ICommandHooks"></a>

- *Implemented By:* <a href="#uv-python-lambda.ICommandHooks">ICommandHooks</a>

Command hooks.

These commands will run in the environment in which bundling occurs: inside
the container for Docker bundling or on the host OS for local bundling.

Commands are chained with `&&`.

```text
{
  // Run tests prior to bundling
  beforeBundling(inputDir: string, outputDir: string): string[] {
    return [`pytest`];
  }
  // ...
}
```

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#uv-python-lambda.ICommandHooks.afterBundling">afterBundling</a></code> | Returns commands to run after bundling. |
| <code><a href="#uv-python-lambda.ICommandHooks.beforeBundling">beforeBundling</a></code> | Returns commands to run before bundling. |

---

##### `afterBundling` <a name="afterBundling" id="uv-python-lambda.ICommandHooks.afterBundling"></a>

```typescript
public afterBundling(inputDir: string, outputDir: string): string[]
```

Returns commands to run after bundling.

Commands are chained with `&&`.

###### `inputDir`<sup>Required</sup> <a name="inputDir" id="uv-python-lambda.ICommandHooks.afterBundling.parameter.inputDir"></a>

- *Type:* string

---

###### `outputDir`<sup>Required</sup> <a name="outputDir" id="uv-python-lambda.ICommandHooks.afterBundling.parameter.outputDir"></a>

- *Type:* string

---

##### `beforeBundling` <a name="beforeBundling" id="uv-python-lambda.ICommandHooks.beforeBundling"></a>

```typescript
public beforeBundling(inputDir: string, outputDir: string): string[]
```

Returns commands to run before bundling.

Commands are chained with `&&`.

###### `inputDir`<sup>Required</sup> <a name="inputDir" id="uv-python-lambda.ICommandHooks.beforeBundling.parameter.inputDir"></a>

- *Type:* string

---

###### `outputDir`<sup>Required</sup> <a name="outputDir" id="uv-python-lambda.ICommandHooks.beforeBundling.parameter.outputDir"></a>

- *Type:* string

---


