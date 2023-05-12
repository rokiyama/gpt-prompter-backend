# gpt-prompter

## frontend

### build

```sh
npm ci

# increment ios buildNumber
jq '.expo.ios.buildNumber = (."expo".ios.buildNumber | tonumber + 1 | tostring) | . ' app.json > app_new.json && mv app_new.json app.json

eas build --platform ios --auto-submit
```

## backend

### Bootstrap

```sh
npm run cdk bootstrap
```

### Deploy

```sh
npm run cdk deploy
```

### Register OpenAI API Key to SSM Parameter Store as a secret string

```sh
aws ssm put-parameter --name /openai/apiKey --value $OPENAI_API_KEY --type SecureString --key-id alias/lambda-kms-key
```
