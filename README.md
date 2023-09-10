# gpt-prompter-backend

## build

```sh
npm run build
```

## Bootstrap

```sh
# dev
npm run cdk bootstrap

# prod
ENV=prod npm run cdk bootstrap
```

## Deploy

```sh
# dev
npm run cdk diff
npm run cdk deploy

# prod
ENV=prod npm run cdk diff
ENV=prod npm run cdk deploy
```

## Register OpenAI API Key to SSM Parameter Store as a secret string

```sh
aws ssm put-parameter --name /openai/apiKey/prod --value $OPENAI_API_KEY --type SecureString --key-id alias/lambda-kms-key-prod

# dev
aws ssm put-parameter --name /openai/apiKey/dev --value $OPENAI_API_KEY --type SecureString --key-id alias/lambda-kms-key-dev
```
