import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    region: 'ap-southeast-1',
    userPoolId: 'ap-southeast-1_isJDSDjJW',
    userPoolWebClientId: '49l159f437hkgb0i8s38fr8q5n',
  }
};

Amplify.configure(awsConfig);

export default awsConfig;