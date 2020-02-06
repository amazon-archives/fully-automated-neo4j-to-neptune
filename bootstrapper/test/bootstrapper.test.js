const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const Bootstrapper = require('../lib/bootstrapper-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Bootstrapper.BootstrapperStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});