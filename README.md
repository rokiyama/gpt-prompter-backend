# gpt-prompter-backend

## build

```sh
npm run build
```

## Bootstrap

```sh
ENV=prod npm run cdk bootstrap
```

## Deploy

```sh
ENV=prod npm run cdk deploy
```

## Register OpenAI API Key to SSM Parameter Store as a secret string

```sh
aws ssm put-parameter --name /openai/apiKey --value $OPENAI_API_KEY --type SecureString --key-id alias/lambda-kms-key
```
