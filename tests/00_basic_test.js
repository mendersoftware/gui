var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    assert = require('assert'),
    username = "menderio",
    accessKey = process.env.SAUCELABS_ACCESS_KEY,
    SauceLabs = require('saucelabs'),
    test = require('selenium-webdriver/testing'),
    driver;

saucelabs = new SauceLabs({
    username: username,
    password: accessKey
});

var site = "https://dev-gui.mender.io:8080",
    testing_platform = process.env.PLATFORM,
    testing_browser = process.env.BROWSER

if (process.env.RUN_ON_SAUCELABS.toLowerCase() == "true") {
    driver = new webdriver.Builder().
    withCapabilities({
            'platform': testing_platform,
            'browserName': testing_browser,
            'username': username,
            'accessKey': accessKey
        }
    ).
    usingServer("https://" + username + ":" + accessKey +
        "@ondemand.saucelabs.com:443/wd/hub").
    build();

    driver.getSession().then(function(sessionid) {
        driver.sessionID = sessionid.id_;
    });

} else {
    console.log("test")
    driver = new webdriver.Builder().usingServer().withCapabilities({
        'browserName': 'firefox'
    }).build();
}


test.describe('Mender', function() {
    test.afterEach(function(done) {
        var title = "Mender testing",
            passed = (this.currentTest.state === 'passed') ? true : false;

        saucelabs.showJob(driver.sessionID, function(err, res) {
            if (res.passed != null) {
                passed = passed && res.passed
            }
            saucelabs.updateJob(driver.sessionID, {
                name: title,
                passed: passed
            }, function(err, res) {
                done();
            })
        })
    })

    test.after(function(done) {
        driver.quit()
        done()
    })

    it('should have corrent title set', function(done) {
        this.timeout(0)
        driver.get(site);
        driver.getTitle().then(function(value) {
            assert.equal(value, 'Mender');
            done();
        });
    });

    it('deployments is navigable', function(done) {
            driver.wait(until.elementLocated(By.xpath("//*[text()='Deployments']")), 1000).then(function(webElement) {
                driver.findElement(By.xpath("//*[text()='Deployments']")).click().then(function(value) {
                    done();
                })
            })
})
})

