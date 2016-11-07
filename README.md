# NetID / EmplID Lookup

- Serverless Framework 0.5.5
- AWS Lambda running Node 4.3
- AWS ElastiCache Redis
- AWS S3


## Initial Data Load
- No endpoint
- Intended to run on a scheduled basis (daily)
- Lambda runs in VPC with ElastiCache server running Redis
- Loads a CSV from S3
- Creates NetId -> EmplId and EmplId -> NetId mappings as key value pairs using Redis


## ID Lookup

- Endpoint at `/get-netid-emplid/?id={EmplId or NetID}`
- Using API Gateway (through Serverless)
- Runs Lambda method in VPC with Elasticache Server
- Returns value if found
- Uses API Key to protect endpoint on the public internet


## Areas for Improvement

- API Cache for future performance improvement
- API endpoint could be parameterized rather than using query string
- Query string could take a list and return multiple responses


## Lessons Learned

- Deploy required use of `AWSLambdaVPCAccessExecutionRole` role in IAM
- Performance improves with a "warm" Lambda
