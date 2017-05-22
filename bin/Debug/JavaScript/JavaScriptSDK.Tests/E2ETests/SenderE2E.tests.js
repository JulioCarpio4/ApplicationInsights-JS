var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="..\External\qunit.d.ts" />
/** Wrapper around QUnit asserts. This class has two purposes:
 * - Make Assertion methods easy to discover.
 * - Make them consistent with XUnit assertions in the order of the actual and expected parameter values.
 */
var Assert = (function () {
    function Assert() {
    }
    /**
    * A deep recursive comparison assertion, working on primitive types, arrays, objects,
    * regular expressions, dates and functions.
    *
    * The deepEqual() assertion can be used just like equal() when comparing the value of
    * objects, such that { key: value } is equal to { key: value }. For non-scalar values,
    * identity will be disregarded by deepEqual.
    *
    * @param expected Known comparison value
    * @param actual Object or Expression being tested
    * @param message A short description of the assertion
    */
    Assert.deepEqual = function (expected, actual, message) {
        return deepEqual(actual, expected, message);
    };
    /**
    * A non-strict comparison assertion, roughly equivalent to JUnit assertEquals.
    *
    * The equal assertion uses the simple comparison operator (==) to compare the actual
    * and expected arguments. When they are equal, the assertion passes: any; otherwise, it fails.
    * When it fails, both actual and expected values are displayed in the test result,
    * in addition to a given message.
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.equal = function (expected, actual, message) {
        return equal(actual, expected, message);
    };
    /**
    * An inverted deep recursive comparison assertion, working on primitive types,
    * arrays, objects, regular expressions, dates and functions.
    *
    * The notDeepEqual() assertion can be used just like equal() when comparing the
    * value of objects, such that { key: value } is equal to { key: value }. For non-scalar
    * values, identity will be disregarded by notDeepEqual.
    *
    * @param expected Known comparison value
    * @param actual Object or Expression being tested
    * @param message A short description of the assertion
    */
    Assert.notDeepEqual = function (expected, actual, message) {
        return notDeepEqual(actual, expected, message);
    };
    /**
    * A non-strict comparison assertion, checking for inequality.
    *
    * The notEqual assertion uses the simple inverted comparison operator (!=) to compare
    * the actual and expected arguments. When they aren't equal, the assertion passes: any;
    * otherwise, it fails. When it fails, both actual and expected values are displayed
    * in the test result, in addition to a given message.
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.notEqual = function (expected, actual, message) {
        return notEqual(actual, expected, message);
    };
    Assert.notPropEqual = function (expected, actual, message) {
        return notPropEqual(actual, expected, message);
    };
    Assert.propEqual = function (expected, actual, message) {
        return propEqual(actual, expected, message);
    };
    /**
    * A non-strict comparison assertion, checking for inequality.
    *
    * The notStrictEqual assertion uses the strict inverted comparison operator (!==)
    * to compare the actual and expected arguments. When they aren't equal, the assertion
    * passes: any; otherwise, it fails. When it fails, both actual and expected values are
    * displayed in the test result, in addition to a given message.
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.notStrictEqual = function (expected, actual, message) {
        return notStrictEqual(actual, expected, message);
    };
    /**
    * A boolean assertion, equivalent to CommonJS's assert.ok() and JUnit's assertTrue().
    * Passes if the first argument is truthy.
    *
    * The most basic assertion in QUnit, ok() requires just one argument. If the argument
    * evaluates to true, the assertion passes; otherwise, it fails. If a second message
    * argument is provided, it will be displayed in place of the result.
    *
    * @param state Expression being tested
    * @param message A short description of the assertion
    */
    Assert.ok = function (state, message) {
        return ok(state, message);
    };
    /**
    * A strict type and value comparison assertion.
    *
    * The strictEqual() assertion provides the most rigid comparison of type and value with
    * the strict equality operator (===)
    *
    * @param expected Known comparison value
    * @param actual Expression being tested
    * @param message A short description of the assertion
    */
    Assert.strictEqual = function (expected, actual, message) {
        return strictEqual(actual, expected, message);
    };
    Assert.throws = function (block, expected, message) {
        return throws(block, expected, message);
    };
    return Assert;
}());
/** Defines a test case */
var TestCase = (function () {
    function TestCase() {
    }
    return TestCase;
}());
/// <reference path="..\External\sinon.d.ts" />
/// <reference path="..\External\qunit.d.ts" />
/// <reference path="Assert.ts" />
/// <reference path="./TestCase.ts"/>
var TestClass = (function () {
    function TestClass(name) {
        /** Turns on/off sinon's syncronous implementation of setTimeout. On by default. */
        this.useFakeTimers = true;
        /** Turns on/off sinon's fake implementation of XMLHttpRequest. On by default. */
        this.useFakeServer = true;
        QUnit.module(name);
    }
    /** Method called before the start of each test method */
    TestClass.prototype.testInitialize = function () {
    };
    /** Method called after each test method has completed */
    TestClass.prototype.testCleanup = function () {
    };
    /** Method in which test class intances should call this.testCase(...) to register each of this suite's tests. */
    TestClass.prototype.registerTests = function () {
    };
    /** Register an async Javascript unit testcase. */
    TestClass.prototype.testCaseAsync = function (testInfo) {
        var _this = this;
        if (!testInfo.name) {
            throw new Error("Must specify name in testInfo context in registerTestcase call");
        }
        if (isNaN(testInfo.stepDelay)) {
            throw new Error("Must specify 'stepDelay' period between pre and post");
        }
        if (!testInfo.steps) {
            throw new Error("Must specify 'steps' to take asynchronously");
        }
        // Create a wrapper around the test method so we can do test initilization and cleanup.
        var testMethod = function (assert) {
            var done = assert.async();
            // Save off the instance of the currently running suite.
            TestClass.currentTestClass = _this;
            // Run the test.
            try {
                _this._testStarting();
                var steps = testInfo.steps;
                var trigger = function () {
                    if (steps.length) {
                        var step = steps.shift();
                        // The callback which activates the next test step. 
                        var nextTestStepTrigger = function () {
                            setTimeout(function () {
                                trigger();
                            }, testInfo.stepDelay);
                        };
                        // There 2 types of test steps - simple and polling.
                        // Upon completion of the simple test step the next test step will be called.
                        // In case of polling test step the next test step is passed to the polling test step, and
                        // it is responsibility of the polling test step to call the next test step.
                        try {
                            if (step[TestClass.isPollingStepFlag]) {
                                step.call(_this, nextTestStepTrigger);
                            }
                            else {
                                step.call(_this);
                                nextTestStepTrigger.call(_this);
                            }
                        }
                        catch (e) {
                            _this._testCompleted();
                            Assert.ok(false, e.toString());
                            // done is QUnit callback indicating the end of the test
                            done();
                            return;
                        }
                    }
                    else {
                        _this._testCompleted();
                        // done is QUnit callback indicating the end of the test
                        done();
                    }
                };
                trigger();
            }
            catch (ex) {
                Assert.ok(false, "Unexpected Exception: " + ex);
                _this._testCompleted(true);
                // done is QUnit callback indicating the end of the test
                done();
            }
        };
        // Register the test with QUnit
        QUnit.test(testInfo.name, testMethod);
    };
    /** Register a Javascript unit testcase. */
    TestClass.prototype.testCase = function (testInfo) {
        var _this = this;
        if (!testInfo.name) {
            throw new Error("Must specify name in testInfo context in registerTestcase call");
        }
        if (!testInfo.test) {
            throw new Error("Must specify 'test' method in testInfo context in registerTestcase call");
        }
        // Create a wrapper around the test method so we can do test initilization and cleanup.
        var testMethod = function () {
            // Save off the instance of the currently running suite.
            TestClass.currentTestClass = _this;
            // Run the test.
            try {
                _this._testStarting();
                testInfo.test.call(_this);
                _this._testCompleted();
            }
            catch (ex) {
                Assert.ok(false, "Unexpected Exception: " + ex);
                _this._testCompleted(true);
            }
        };
        // Register the test with QUnit
        test(testInfo.name, testMethod);
    };
    /** Called when the test is starting. */
    TestClass.prototype._testStarting = function () {
        // Initialize the sandbox similar to what is done in sinon.js "test()" override. See note on class.
        var config = sinon.getConfig(sinon.config);
        config.useFakeTimers = this.useFakeTimers;
        config.useFakeServer = this.useFakeServer;
        config.injectInto = config.injectIntoThis && this || config.injectInto;
        this.sandbox = sinon.sandbox.create(config);
        this.server = this.sandbox.server;
        // Allow the derived class to perform test initialization.
        this.testInitialize();
    };
    /** Called when the test is completed. */
    TestClass.prototype._testCompleted = function (failed) {
        if (failed) {
            // Just cleanup the sandbox since the test has already failed.
            this.sandbox.restore();
        }
        else {
            // Verify the sandbox and restore.
            this.sandbox.verifyAndRestore();
        }
        this.testCleanup();
        // Clear the instance of the currently running suite.
        TestClass.currentTestClass = null;
    };
    TestClass.prototype.spy = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return null;
    };
    TestClass.prototype.stub = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return null;
    };
    /** Creates a mock for the provided object.Does not change the object, but returns a mock object to set expectations on the object's methods. */
    TestClass.prototype.mock = function (object) { return null; };
    /**** end: Sinon methods and properties ***/
    /** Sends a JSON response to the provided request.
     * @param request The request to respond to.
     * @param data Data to respond with.
     * @param errorCode Optional error code to send with the request, default is 200
    */
    TestClass.prototype.sendJsonResponse = function (request, data, errorCode) {
        if (errorCode === undefined) {
            errorCode = 200;
        }
        request.respond(errorCode, { "Content-Type": "application/json" }, JSON.stringify(data));
    };
    TestClass.prototype.setUserAgent = function (userAgent) {
        Object.defineProperty(window.navigator, 'userAgent', {
            configurable: true,
            get: function () {
                return userAgent;
            }
        });
    };
    TestClass.isPollingStepFlag = "isPollingStep";
    return TestClass;
}());
// Configure Sinon
sinon.assert.fail = function (msg) {
    Assert.ok(false, msg);
};
sinon.assert.pass = function (assertion) {
    Assert.ok(assertion, "sinon assert");
};
sinon.config = {
    injectIntoThis: true,
    injectInto: null,
    properties: ["spy", "stub", "mock", "clock", "sandbox"],
    useFakeTimers: true,
    useFakeServer: true
};
/// <reference path="..\External\qunit.d.ts" />
/// <reference path="testclass.ts" />
var PollingAssert = (function () {
    function PollingAssert() {
    }
    /**
    * Starts polling assertion function for a period of time after which it's considered failed.
    * @param {() => boolean} assertionFunctionReturnsBoolean - funciton returning true if condition passes and false if condition fails. Assertion will be done on this function's result.
    * @param {string} assertDescription - message shown with the assertion
    * @param {number} timeoutSeconds - timeout in seconds after which assertion fails
    * @param {number} pollIntervalMs - polling interval in milliseconds
    * @returns {(nextTestStep) => void} callback which will be invoked by the TestClass
    */
    PollingAssert.createPollingAssert = function (assertionFunctionReturnsBoolean, assertDescription, timeoutSeconds, pollIntervalMs) {
        var _this = this;
        if (timeoutSeconds === void 0) { timeoutSeconds = 30; }
        if (pollIntervalMs === void 0) { pollIntervalMs = 500; }
        var pollingAssert = function (nextTestStep) {
            var timeout = new Date(new Date().getTime() + timeoutSeconds * 1000);
            var polling = function () {
                if (assertionFunctionReturnsBoolean.apply(_this)) {
                    Assert.ok(true, assertDescription);
                    nextTestStep();
                }
                else if (timeout < new Date()) {
                    Assert.ok(false, "assert didn't succeed for " + timeout + " seconds: " + assertDescription);
                    nextTestStep();
                }
                else {
                    setTimeout(polling, pollIntervalMs);
                }
            };
            setTimeout(polling, pollIntervalMs);
        };
        pollingAssert[TestClass.isPollingStepFlag] = true;
        return pollingAssert;
    };
    return PollingAssert;
}());
/// <reference path="..\External\sinon.d.ts" />
/// <reference path="..\External\qunit.d.ts" />
/// <reference path="Assert.ts" />
/// <reference path="PollingAssert.ts" />
/// <reference path="TestClass.ts" />
/// <reference path="TestCase.ts" /> 
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        (function (LoggingSeverity) {
            /**
             * Error will be sent as internal telemetry
             */
            LoggingSeverity[LoggingSeverity["CRITICAL"] = 0] = "CRITICAL";
            /**
             * Error will NOT be sent as internal telemetry, and will only be shown in browser console
             */
            LoggingSeverity[LoggingSeverity["WARNING"] = 1] = "WARNING";
        })(ApplicationInsights.LoggingSeverity || (ApplicationInsights.LoggingSeverity = {}));
        var LoggingSeverity = ApplicationInsights.LoggingSeverity;
        /**
         * Internal message ID. Please create a new one for every conceptually different message. Please keep alphabetically ordered
         */
        (function (_InternalMessageId) {
            // Non user actionable
            _InternalMessageId[_InternalMessageId["BrowserDoesNotSupportLocalStorage"] = 0] = "BrowserDoesNotSupportLocalStorage";
            _InternalMessageId[_InternalMessageId["BrowserCannotReadLocalStorage"] = 1] = "BrowserCannotReadLocalStorage";
            _InternalMessageId[_InternalMessageId["BrowserCannotReadSessionStorage"] = 2] = "BrowserCannotReadSessionStorage";
            _InternalMessageId[_InternalMessageId["BrowserCannotWriteLocalStorage"] = 3] = "BrowserCannotWriteLocalStorage";
            _InternalMessageId[_InternalMessageId["BrowserCannotWriteSessionStorage"] = 4] = "BrowserCannotWriteSessionStorage";
            _InternalMessageId[_InternalMessageId["BrowserFailedRemovalFromLocalStorage"] = 5] = "BrowserFailedRemovalFromLocalStorage";
            _InternalMessageId[_InternalMessageId["BrowserFailedRemovalFromSessionStorage"] = 6] = "BrowserFailedRemovalFromSessionStorage";
            _InternalMessageId[_InternalMessageId["CannotSendEmptyTelemetry"] = 7] = "CannotSendEmptyTelemetry";
            _InternalMessageId[_InternalMessageId["ClientPerformanceMathError"] = 8] = "ClientPerformanceMathError";
            _InternalMessageId[_InternalMessageId["ErrorParsingAISessionCookie"] = 9] = "ErrorParsingAISessionCookie";
            _InternalMessageId[_InternalMessageId["ErrorPVCalc"] = 10] = "ErrorPVCalc";
            _InternalMessageId[_InternalMessageId["ExceptionWhileLoggingError"] = 11] = "ExceptionWhileLoggingError";
            _InternalMessageId[_InternalMessageId["FailedAddingTelemetryToBuffer"] = 12] = "FailedAddingTelemetryToBuffer";
            _InternalMessageId[_InternalMessageId["FailedMonitorAjaxAbort"] = 13] = "FailedMonitorAjaxAbort";
            _InternalMessageId[_InternalMessageId["FailedMonitorAjaxDur"] = 14] = "FailedMonitorAjaxDur";
            _InternalMessageId[_InternalMessageId["FailedMonitorAjaxOpen"] = 15] = "FailedMonitorAjaxOpen";
            _InternalMessageId[_InternalMessageId["FailedMonitorAjaxRSC"] = 16] = "FailedMonitorAjaxRSC";
            _InternalMessageId[_InternalMessageId["FailedMonitorAjaxSend"] = 17] = "FailedMonitorAjaxSend";
            _InternalMessageId[_InternalMessageId["FailedToAddHandlerForOnBeforeUnload"] = 18] = "FailedToAddHandlerForOnBeforeUnload";
            _InternalMessageId[_InternalMessageId["FailedToSendQueuedTelemetry"] = 19] = "FailedToSendQueuedTelemetry";
            _InternalMessageId[_InternalMessageId["FailedToReportDataLoss"] = 20] = "FailedToReportDataLoss";
            _InternalMessageId[_InternalMessageId["FlushFailed"] = 21] = "FlushFailed";
            _InternalMessageId[_InternalMessageId["MessageLimitPerPVExceeded"] = 22] = "MessageLimitPerPVExceeded";
            _InternalMessageId[_InternalMessageId["MissingRequiredFieldSpecification"] = 23] = "MissingRequiredFieldSpecification";
            _InternalMessageId[_InternalMessageId["NavigationTimingNotSupported"] = 24] = "NavigationTimingNotSupported";
            _InternalMessageId[_InternalMessageId["OnError"] = 25] = "OnError";
            _InternalMessageId[_InternalMessageId["SessionRenewalDateIsZero"] = 26] = "SessionRenewalDateIsZero";
            _InternalMessageId[_InternalMessageId["SenderNotInitialized"] = 27] = "SenderNotInitialized";
            _InternalMessageId[_InternalMessageId["StartTrackEventFailed"] = 28] = "StartTrackEventFailed";
            _InternalMessageId[_InternalMessageId["StopTrackEventFailed"] = 29] = "StopTrackEventFailed";
            _InternalMessageId[_InternalMessageId["StartTrackFailed"] = 30] = "StartTrackFailed";
            _InternalMessageId[_InternalMessageId["StopTrackFailed"] = 31] = "StopTrackFailed";
            _InternalMessageId[_InternalMessageId["TelemetrySampledAndNotSent"] = 32] = "TelemetrySampledAndNotSent";
            _InternalMessageId[_InternalMessageId["TrackEventFailed"] = 33] = "TrackEventFailed";
            _InternalMessageId[_InternalMessageId["TrackExceptionFailed"] = 34] = "TrackExceptionFailed";
            _InternalMessageId[_InternalMessageId["TrackMetricFailed"] = 35] = "TrackMetricFailed";
            _InternalMessageId[_InternalMessageId["TrackPVFailed"] = 36] = "TrackPVFailed";
            _InternalMessageId[_InternalMessageId["TrackPVFailedCalc"] = 37] = "TrackPVFailedCalc";
            _InternalMessageId[_InternalMessageId["TrackTraceFailed"] = 38] = "TrackTraceFailed";
            _InternalMessageId[_InternalMessageId["TransmissionFailed"] = 39] = "TransmissionFailed";
            _InternalMessageId[_InternalMessageId["FailedToSetStorageBuffer"] = 40] = "FailedToSetStorageBuffer";
            _InternalMessageId[_InternalMessageId["FailedToRestoreStorageBuffer"] = 41] = "FailedToRestoreStorageBuffer";
            _InternalMessageId[_InternalMessageId["InvalidBackendResponse"] = 42] = "InvalidBackendResponse";
            _InternalMessageId[_InternalMessageId["FailedToFixDepricatedValues"] = 43] = "FailedToFixDepricatedValues";
            _InternalMessageId[_InternalMessageId["InvalidDurationValue"] = 44] = "InvalidDurationValue";
            // User actionable
            _InternalMessageId[_InternalMessageId["CannotSerializeObject"] = 45] = "CannotSerializeObject";
            _InternalMessageId[_InternalMessageId["CannotSerializeObjectNonSerializable"] = 46] = "CannotSerializeObjectNonSerializable";
            _InternalMessageId[_InternalMessageId["CircularReferenceDetected"] = 47] = "CircularReferenceDetected";
            _InternalMessageId[_InternalMessageId["ClearAuthContextFailed"] = 48] = "ClearAuthContextFailed";
            _InternalMessageId[_InternalMessageId["ExceptionTruncated"] = 49] = "ExceptionTruncated";
            _InternalMessageId[_InternalMessageId["IllegalCharsInName"] = 50] = "IllegalCharsInName";
            _InternalMessageId[_InternalMessageId["ItemNotInArray"] = 51] = "ItemNotInArray";
            _InternalMessageId[_InternalMessageId["MaxAjaxPerPVExceeded"] = 52] = "MaxAjaxPerPVExceeded";
            _InternalMessageId[_InternalMessageId["MessageTruncated"] = 53] = "MessageTruncated";
            _InternalMessageId[_InternalMessageId["NameTooLong"] = 54] = "NameTooLong";
            _InternalMessageId[_InternalMessageId["SampleRateOutOfRange"] = 55] = "SampleRateOutOfRange";
            _InternalMessageId[_InternalMessageId["SetAuthContextFailed"] = 56] = "SetAuthContextFailed";
            _InternalMessageId[_InternalMessageId["SetAuthContextFailedAccountName"] = 57] = "SetAuthContextFailedAccountName";
            _InternalMessageId[_InternalMessageId["StringValueTooLong"] = 58] = "StringValueTooLong";
            _InternalMessageId[_InternalMessageId["StartCalledMoreThanOnce"] = 59] = "StartCalledMoreThanOnce";
            _InternalMessageId[_InternalMessageId["StopCalledWithoutStart"] = 60] = "StopCalledWithoutStart";
            _InternalMessageId[_InternalMessageId["TelemetryInitializerFailed"] = 61] = "TelemetryInitializerFailed";
            _InternalMessageId[_InternalMessageId["TrackArgumentsNotSpecified"] = 62] = "TrackArgumentsNotSpecified";
            _InternalMessageId[_InternalMessageId["UrlTooLong"] = 63] = "UrlTooLong";
            _InternalMessageId[_InternalMessageId["SessionStorageBufferFull"] = 64] = "SessionStorageBufferFull";
            _InternalMessageId[_InternalMessageId["CannotAccessCookie"] = 65] = "CannotAccessCookie";
        })(ApplicationInsights._InternalMessageId || (ApplicationInsights._InternalMessageId = {}));
        var _InternalMessageId = ApplicationInsights._InternalMessageId;
        var _InternalLogMessage = (function () {
            function _InternalLogMessage(msgId, msg, isUserAct, properties) {
                if (isUserAct === void 0) { isUserAct = false; }
                this.messageId = msgId;
                this.message =
                    (isUserAct ? _InternalLogMessage.AiUserActionablePrefix : _InternalLogMessage.AiNonUserActionablePrefix) +
                        _InternalMessageId[msgId].toString();
                var diagnosticText = (msg ? " message:" + _InternalLogMessage.sanitizeDiagnosticText(msg) : "") +
                    (properties ? " props:" + _InternalLogMessage.sanitizeDiagnosticText(JSON.stringify(properties)) : "");
                this.message += diagnosticText;
            }
            _InternalLogMessage.sanitizeDiagnosticText = function (text) {
                return "\"" + text.replace(/\"/g, "") + "\"";
            };
            /**
             * For user non actionable traces use AI Internal prefix.
             */
            _InternalLogMessage.AiNonUserActionablePrefix = "AI (Internal): ";
            /**
             * Prefix of the traces in portal.
             */
            _InternalLogMessage.AiUserActionablePrefix = "AI: ";
            return _InternalLogMessage;
        }());
        ApplicationInsights._InternalLogMessage = _InternalLogMessage;
        var _InternalLogging = (function () {
            function _InternalLogging() {
            }
            /**
             * This method will throw exceptions in debug mode or attempt to log the error as a console warning.
             * @param severity {LoggingSeverity} - The severity of the log message
             * @param message {_InternalLogMessage} - The log message.
             */
            _InternalLogging.throwInternal = function (severity, msgId, msg, properties, isUserAct) {
                if (isUserAct === void 0) { isUserAct = false; }
                var message = new _InternalLogMessage(msgId, msg, isUserAct, properties);
                if (this.enableDebugExceptions()) {
                    throw message;
                }
                else {
                    if (typeof (message) !== "undefined" && !!message) {
                        if (typeof (message.message) !== "undefined") {
                            if (isUserAct) {
                                // check if this message type was already logged to console for this page view and if so, don't log it again
                                var messageKey = _InternalMessageId[message.messageId];
                                if (!this._messageLogged[messageKey] || this.verboseLogging()) {
                                    this.warnToConsole(message.message);
                                    this._messageLogged[messageKey] = true;
                                }
                            }
                            else {
                                // don't log internal AI traces in the console, unless the verbose logging is enabled
                                if (this.verboseLogging()) {
                                    this.warnToConsole(message.message);
                                }
                            }
                            this.logInternalMessage(severity, message);
                        }
                    }
                }
            };
            /**
             * This will write a warning to the console if possible
             * @param message {string} - The warning message
             */
            _InternalLogging.warnToConsole = function (message) {
                if (typeof console !== "undefined" && !!console) {
                    if (typeof console.warn === "function") {
                        console.warn(message);
                    }
                    else if (typeof console.log === "function") {
                        console.log(message);
                    }
                }
            };
            /**
             * Resets the internal message count
             */
            _InternalLogging.resetInternalMessageCount = function () {
                this._messageCount = 0;
                this._messageLogged = {};
            };
            /**
             * Clears the list of records indicating that internal message type was already logged
             */
            _InternalLogging.clearInternalMessageLoggedTypes = function () {
                if (ApplicationInsights.Util.canUseSessionStorage()) {
                    var sessionStorageKeys = ApplicationInsights.Util.getSessionStorageKeys();
                    for (var i = 0; i < sessionStorageKeys.length; i++) {
                        if (sessionStorageKeys[i].indexOf(_InternalLogging.AIInternalMessagePrefix) === 0) {
                            ApplicationInsights.Util.removeSessionStorage(sessionStorageKeys[i]);
                        }
                    }
                }
            };
            /**
             * Sets the limit for the number of internal events before they are throttled
             * @param limit {number} - The throttle limit to set for internal events
             */
            _InternalLogging.setMaxInternalMessageLimit = function (limit) {
                if (!limit) {
                    throw new Error('limit cannot be undefined.');
                }
                this.MAX_INTERNAL_MESSAGE_LIMIT = limit;
            };
            /**
             * Logs a message to the internal queue.
             * @param severity {LoggingSeverity} - The severity of the log message
             * @param message {_InternalLogMessage} - The message to log.
             */
            _InternalLogging.logInternalMessage = function (severity, message) {
                if (this._areInternalMessagesThrottled()) {
                    return;
                }
                // check if this message type was already logged for this session and if so, don't log it again
                var logMessage = true;
                var messageKey = _InternalLogging.AIInternalMessagePrefix + _InternalMessageId[message.messageId];
                if (ApplicationInsights.Util.canUseSessionStorage()) {
                    var internalMessageTypeLogRecord = ApplicationInsights.Util.getSessionStorage(messageKey);
                    if (internalMessageTypeLogRecord) {
                        logMessage = false;
                    }
                    else {
                        ApplicationInsights.Util.setSessionStorage(messageKey, "1");
                    }
                }
                else {
                    // if the session storage is not available, limit to only one message type per page view
                    if (this._messageLogged[messageKey]) {
                        logMessage = false;
                    }
                    else {
                        this._messageLogged[messageKey] = true;
                    }
                }
                if (logMessage) {
                    // Push the event in the internal queue
                    if (this.verboseLogging() || severity === LoggingSeverity.CRITICAL) {
                        this.queue.push(message);
                        this._messageCount++;
                    }
                    // When throttle limit reached, send a special event
                    if (this._messageCount == this.MAX_INTERNAL_MESSAGE_LIMIT) {
                        var throttleLimitMessage = "Internal events throttle limit per PageView reached for this app.";
                        var throttleMessage = new _InternalLogMessage(_InternalMessageId.MessageLimitPerPVExceeded, throttleLimitMessage, false);
                        this.queue.push(throttleMessage);
                        this.warnToConsole(throttleLimitMessage);
                    }
                }
            };
            /**
             * Indicates whether the internal events are throttled
             */
            _InternalLogging._areInternalMessagesThrottled = function () {
                return this._messageCount >= this.MAX_INTERNAL_MESSAGE_LIMIT;
            };
            /**
            *  Session storage key for the prefix for the key indicating message type already logged
            */
            _InternalLogging.AIInternalMessagePrefix = "AITR_";
            /**
             * When this is true the SDK will throw exceptions to aid in debugging.
             */
            _InternalLogging.enableDebugExceptions = function () { return false; };
            /**
             * When this is true the SDK will log more messages to aid in debugging.
             */
            _InternalLogging.verboseLogging = function () { return false; };
            /**
             * The internal logging queue
             */
            _InternalLogging.queue = [];
            /**
             * The maximum number of internal messages allowed to be sent per page view
             */
            _InternalLogging.MAX_INTERNAL_MESSAGE_LIMIT = 25;
            /**
             * Count of internal messages sent
             */
            _InternalLogging._messageCount = 0;
            /**
             * Holds information about what message types were already logged to console or sent to server.
             */
            _InternalLogging._messageLogged = {};
            return _InternalLogging;
        }());
        ApplicationInsights._InternalLogging = _InternalLogging;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="./logging.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        /**
        * Type of storage to differentiate between local storage and session storage
        */
        var StorageType;
        (function (StorageType) {
            StorageType[StorageType["LocalStorage"] = 0] = "LocalStorage";
            StorageType[StorageType["SessionStorage"] = 1] = "SessionStorage";
        })(StorageType || (StorageType = {}));
        var Util = (function () {
            function Util() {
            }
            /*
             * Force the SDK not to use local and session storage
            */
            Util.disableStorage = function () {
                Util._canUseLocalStorage = false;
                Util._canUseSessionStorage = false;
            };
            /**
             * Gets the localStorage object if available
             * @return {Storage} - Returns the storage object if available else returns null
             */
            Util._getLocalStorageObject = function () {
                if (Util.canUseLocalStorage()) {
                    return Util._getVerifiedStorageObject(StorageType.LocalStorage);
                }
                return null;
            };
            /**
             * Tests storage object (localStorage or sessionStorage) to verify that it is usable
             * More details here: https://mathiasbynens.be/notes/localstorage-pattern
             * @param storageType Type of storage
             * @return {Storage} Returns storage object verified that it is usable
             */
            Util._getVerifiedStorageObject = function (storageType) {
                var storage = null;
                var fail;
                var uid;
                try {
                    uid = new Date;
                    storage = storageType === StorageType.LocalStorage ? window.localStorage : window.sessionStorage;
                    storage.setItem(uid, uid);
                    fail = storage.getItem(uid) != uid;
                    storage.removeItem(uid);
                    if (fail) {
                        storage = null;
                    }
                }
                catch (exception) {
                    storage = null;
                }
                return storage;
            };
            /**
             *  Check if the browser supports local storage.
             *
             *  @returns {boolean} True if local storage is supported.
             */
            Util.canUseLocalStorage = function () {
                if (Util._canUseLocalStorage === undefined) {
                    Util._canUseLocalStorage = !!Util._getVerifiedStorageObject(StorageType.LocalStorage);
                }
                return Util._canUseLocalStorage;
            };
            /**
             *  Get an object from the browser's local storage
             *
             *  @param {string} name - the name of the object to get from storage
             *  @returns {string} The contents of the storage object with the given name. Null if storage is not supported.
             */
            Util.getStorage = function (name) {
                var storage = Util._getLocalStorageObject();
                if (storage !== null) {
                    try {
                        return storage.getItem(name);
                    }
                    catch (e) {
                        Util._canUseLocalStorage = false;
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.BrowserCannotReadLocalStorage, "Browser failed read of local storage. " + Util.getExceptionName(e), { exception: Util.dump(e) });
                    }
                }
                return null;
            };
            /**
             *  Set the contents of an object in the browser's local storage
             *
             *  @param {string} name - the name of the object to set in storage
             *  @param {string} data - the contents of the object to set in storage
             *  @returns {boolean} True if the storage object could be written.
             */
            Util.setStorage = function (name, data) {
                var storage = Util._getLocalStorageObject();
                if (storage !== null) {
                    try {
                        storage.setItem(name, data);
                        return true;
                    }
                    catch (e) {
                        Util._canUseLocalStorage = false;
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.BrowserCannotWriteLocalStorage, "Browser failed write to local storage. " + Util.getExceptionName(e), { exception: Util.dump(e) });
                    }
                }
                return false;
            };
            /**
             *  Remove an object from the browser's local storage
             *
             *  @param {string} name - the name of the object to remove from storage
             *  @returns {boolean} True if the storage object could be removed.
             */
            Util.removeStorage = function (name) {
                var storage = Util._getLocalStorageObject();
                if (storage !== null) {
                    try {
                        storage.removeItem(name);
                        return true;
                    }
                    catch (e) {
                        Util._canUseLocalStorage = false;
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.BrowserFailedRemovalFromLocalStorage, "Browser failed removal of local storage item. " + Util.getExceptionName(e), { exception: Util.dump(e) });
                    }
                }
                return false;
            };
            /**
             * Gets the sessionStorage object if available
             * @return {Storage} - Returns the storage object if available else returns null
             */
            Util._getSessionStorageObject = function () {
                if (Util.canUseSessionStorage()) {
                    return Util._getVerifiedStorageObject(StorageType.SessionStorage);
                }
                return null;
            };
            /**
             *  Check if the browser supports session storage.
             *
             *  @returns {boolean} True if session storage is supported.
             */
            Util.canUseSessionStorage = function () {
                if (Util._canUseSessionStorage === undefined) {
                    Util._canUseSessionStorage = !!Util._getVerifiedStorageObject(StorageType.SessionStorage);
                }
                return Util._canUseSessionStorage;
            };
            /**
             *  Gets the list of session storage keys
             *
             *  @returns {string[]} List of session storage keys
             */
            Util.getSessionStorageKeys = function () {
                var keys = [];
                if (Util.canUseSessionStorage()) {
                    for (var key in window.sessionStorage) {
                        keys.push(key);
                    }
                }
                return keys;
            };
            /**
             *  Get an object from the browser's session storage
             *
             *  @param {string} name - the name of the object to get from storage
             *  @returns {string} The contents of the storage object with the given name. Null if storage is not supported.
             */
            Util.getSessionStorage = function (name) {
                var storage = Util._getSessionStorageObject();
                if (storage !== null) {
                    try {
                        return storage.getItem(name);
                    }
                    catch (e) {
                        Util._canUseSessionStorage = false;
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.BrowserCannotReadSessionStorage, "Browser failed read of session storage. " + Util.getExceptionName(e), { exception: Util.dump(e) });
                    }
                }
                return null;
            };
            /**
             *  Set the contents of an object in the browser's session storage
             *
             *  @param {string} name - the name of the object to set in storage
             *  @param {string} data - the contents of the object to set in storage
             *  @returns {boolean} True if the storage object could be written.
             */
            Util.setSessionStorage = function (name, data) {
                var storage = Util._getSessionStorageObject();
                if (storage !== null) {
                    try {
                        storage.setItem(name, data);
                        return true;
                    }
                    catch (e) {
                        Util._canUseSessionStorage = false;
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.BrowserCannotWriteSessionStorage, "Browser failed write to session storage. " + Util.getExceptionName(e), { exception: Util.dump(e) });
                    }
                }
                return false;
            };
            /**
             *  Remove an object from the browser's session storage
             *
             *  @param {string} name - the name of the object to remove from storage
             *  @returns {boolean} True if the storage object could be removed.
             */
            Util.removeSessionStorage = function (name) {
                var storage = Util._getSessionStorageObject();
                if (storage !== null) {
                    try {
                        storage.removeItem(name);
                        return true;
                    }
                    catch (e) {
                        Util._canUseSessionStorage = false;
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.BrowserFailedRemovalFromSessionStorage, "Browser failed removal of session storage item. " + Util.getExceptionName(e), { exception: Util.dump(e) });
                    }
                }
                return false;
            };
            /*
             * Force the SDK not to store and read any data from cookies
             */
            Util.disableCookies = function () {
                Util._canUseCookies = false;
            };
            /*
             * helper method to tell if document.cookie object is available
             */
            Util.canUseCookies = function () {
                if (Util._canUseCookies === undefined) {
                    Util._canUseCookies = false;
                    try {
                        Util._canUseCookies = Util.document.cookie !== undefined;
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.CannotAccessCookie, "Cannot access document.cookie - " + Util.getExceptionName(e), { exception: Util.dump(e) });
                    }
                    ;
                }
                return Util._canUseCookies;
            };
            /**
             * helper method to set userId and sessionId cookie
             */
            Util.setCookie = function (name, value, domain) {
                var domainAttrib = "";
                var secureAttrib = "";
                if (domain) {
                    domainAttrib = ";domain=" + domain;
                }
                if (Util.document.location && Util.document.location.protocol === "https:") {
                    secureAttrib = ";secure";
                }
                if (Util.canUseCookies()) {
                    Util.document.cookie = name + "=" + value + domainAttrib + ";path=/" + secureAttrib;
                }
            };
            Util.stringToBoolOrDefault = function (str, defaultValue) {
                if (defaultValue === void 0) { defaultValue = false; }
                if (str === undefined || str === null) {
                    return defaultValue;
                }
                return str.toString().toLowerCase() === "true";
            };
            /**
             * helper method to access userId and sessionId cookie
             */
            Util.getCookie = function (name) {
                if (!Util.canUseCookies()) {
                    return;
                }
                var value = "";
                if (name && name.length) {
                    var cookieName = name + "=";
                    var cookies = Util.document.cookie.split(";");
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i];
                        cookie = Util.trim(cookie);
                        if (cookie && cookie.indexOf(cookieName) === 0) {
                            value = cookie.substring(cookieName.length, cookies[i].length);
                            break;
                        }
                    }
                }
                return value;
            };
            /**
             * Deletes a cookie by setting it's expiration time in the past.
             * @param name - The name of the cookie to delete.
             */
            Util.deleteCookie = function (name) {
                if (Util.canUseCookies()) {
                    // Setting the expiration date in the past immediately removes the cookie
                    Util.document.cookie = name + "=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                }
            };
            /**
             * helper method to trim strings (IE8 does not implement String.prototype.trim)
             */
            Util.trim = function (str) {
                if (typeof str !== "string")
                    return str;
                return str.replace(/^\s+|\s+$/g, "");
            };
            /**
             * generate random id string
             */
            Util.newId = function () {
                var base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var result = "";
                var random = Math.random() * 1073741824; //5 symbols in base64, almost maxint
                while (random > 0) {
                    var char = base64chars.charAt(random % 64);
                    result += char;
                    random = Math.floor(random / 64);
                }
                return result;
            };
            /**
             * Check if an object is of type Array
             */
            Util.isArray = function (obj) {
                return Object.prototype.toString.call(obj) === "[object Array]";
            };
            /**
             * Check if an object is of type Error
             */
            Util.isError = function (obj) {
                return Object.prototype.toString.call(obj) === "[object Error]";
            };
            /**
             * Check if an object is of type Date
             */
            Util.isDate = function (obj) {
                return Object.prototype.toString.call(obj) === "[object Date]";
            };
            /**
             * Convert a date to I.S.O. format in IE8
             */
            Util.toISOStringForIE8 = function (date) {
                if (Util.isDate(date)) {
                    if (Date.prototype.toISOString) {
                        return date.toISOString();
                    }
                    else {
                        function pad(number) {
                            var r = String(number);
                            if (r.length === 1) {
                                r = "0" + r;
                            }
                            return r;
                        }
                        return date.getUTCFullYear()
                            + "-" + pad(date.getUTCMonth() + 1)
                            + "-" + pad(date.getUTCDate())
                            + "T" + pad(date.getUTCHours())
                            + ":" + pad(date.getUTCMinutes())
                            + ":" + pad(date.getUTCSeconds())
                            + "." + String((date.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                            + "Z";
                    }
                }
            };
            /**
             * Gets IE version if we are running on IE, or null otherwise
             */
            Util.getIEVersion = function (userAgentStr) {
                if (userAgentStr === void 0) { userAgentStr = null; }
                var myNav = userAgentStr ? userAgentStr.toLowerCase() : navigator.userAgent.toLowerCase();
                return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : null;
            };
            /**
             * Convert ms to c# time span format
             */
            Util.msToTimeSpan = function (totalms) {
                if (isNaN(totalms) || totalms < 0) {
                    totalms = 0;
                }
                totalms = Math.round(totalms);
                var ms = "" + totalms % 1000;
                var sec = "" + Math.floor(totalms / 1000) % 60;
                var min = "" + Math.floor(totalms / (1000 * 60)) % 60;
                var hour = "" + Math.floor(totalms / (1000 * 60 * 60)) % 24;
                var days = Math.floor(totalms / (1000 * 60 * 60 * 24));
                ms = ms.length === 1 ? "00" + ms : ms.length === 2 ? "0" + ms : ms;
                sec = sec.length < 2 ? "0" + sec : sec;
                min = min.length < 2 ? "0" + min : min;
                hour = hour.length < 2 ? "0" + hour : hour;
                return (days > 0 ? days + "." : "") + hour + ":" + min + ":" + sec + "." + ms;
            };
            /**
            * Checks if error has no meaningful data inside. Ususally such errors are received by window.onerror when error
            * happens in a script from other domain (cross origin, CORS).
            */
            Util.isCrossOriginError = function (message, url, lineNumber, columnNumber, error) {
                return (message === "Script error." || message === "Script error") && error === null;
            };
            /**
            * Returns string representation of an object suitable for diagnostics logging.
            */
            Util.dump = function (object) {
                var objectTypeDump = Object.prototype.toString.call(object);
                var propertyValueDump = JSON.stringify(object);
                if (objectTypeDump === "[object Error]") {
                    propertyValueDump = "{ stack: '" + object.stack + "', message: '" + object.message + "', name: '" + object.name + "'";
                }
                return objectTypeDump + propertyValueDump;
            };
            /**
            * Returns the name of object if it's an Error. Otherwise, returns empty string.
            */
            Util.getExceptionName = function (object) {
                var objectTypeDump = Object.prototype.toString.call(object);
                if (objectTypeDump === "[object Error]") {
                    return object.name;
                }
                return "";
            };
            /**
             * Adds an event handler for the specified event
             * @param eventName {string} - The name of the event
             * @param callback {any} - The callback function that needs to be executed for the given event
             * @return {boolean} - true if the handler was successfully added
             */
            Util.addEventHandler = function (eventName, callback) {
                if (!window || typeof eventName !== 'string' || typeof callback !== 'function') {
                    return false;
                }
                // Create verb for the event
                var verbEventName = 'on' + eventName;
                // check if addEventListener is available
                if (window.addEventListener) {
                    window.addEventListener(eventName, callback, false);
                }
                else if (window["attachEvent"]) {
                    window["attachEvent"].call(verbEventName, callback);
                }
                else {
                    return false;
                }
                return true;
            };
            /**
             * Tells if a browser supports a Beacon API
             */
            Util.IsBeaconApiSupported = function () {
                return ('sendBeacon' in navigator && navigator.sendBeacon);
            };
            Util.document = typeof document !== "undefined" ? document : {};
            Util._canUseCookies = undefined;
            Util._canUseLocalStorage = undefined;
            Util._canUseSessionStorage = undefined;
            Util.NotSpecified = "not_specified";
            return Util;
        }());
        ApplicationInsights.Util = Util;
        var UrlHelper = (function () {
            function UrlHelper() {
            }
            UrlHelper.parseUrl = function (url) {
                if (!UrlHelper.htmlAnchorElement) {
                    UrlHelper.htmlAnchorElement = !!UrlHelper.document.createElement ? UrlHelper.document.createElement('a') : {};
                }
                UrlHelper.htmlAnchorElement.href = url;
                return UrlHelper.htmlAnchorElement;
            };
            UrlHelper.getAbsoluteUrl = function (url) {
                var result;
                var a = UrlHelper.parseUrl(url);
                if (a) {
                    result = a.href;
                }
                return result;
            };
            UrlHelper.getPathName = function (url) {
                var result;
                var a = UrlHelper.parseUrl(url);
                if (a) {
                    result = a.pathname;
                }
                return result;
            };
            UrlHelper.getCompleteUrl = function (method, absoluteUrl) {
                if (method) {
                    return method.toUpperCase() + " " + absoluteUrl;
                }
                else {
                    return absoluteUrl;
                }
            };
            UrlHelper.document = typeof document !== "undefined" ? document : {};
            return UrlHelper;
        }());
        ApplicationInsights.UrlHelper = UrlHelper;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../JavaScriptSDK.Interfaces/Telemetry/ISerializable.ts" />
/// <reference path="logging.ts" />
/// <reference path="util.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        /**
         * Enum is used in aiDataContract to describe how fields are serialized.
         * For instance: (Fieldtype.Required | FieldType.Array) will mark the field as required and indicate it's an array
         */
        (function (FieldType) {
            FieldType[FieldType["Default"] = 0] = "Default";
            FieldType[FieldType["Required"] = 1] = "Required";
            FieldType[FieldType["Array"] = 2] = "Array";
            FieldType[FieldType["Hidden"] = 4] = "Hidden";
        })(ApplicationInsights.FieldType || (ApplicationInsights.FieldType = {}));
        var FieldType = ApplicationInsights.FieldType;
        ;
        var Serializer = (function () {
            function Serializer() {
            }
            /**
             * Serializes the current object to a JSON string.
             */
            Serializer.serialize = function (input) {
                var output = Serializer._serializeObject(input, "root");
                return JSON.stringify(output);
            };
            Serializer._serializeObject = function (source, name) {
                var circularReferenceCheck = "__aiCircularRefCheck";
                var output = {};
                if (!source) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.CannotSerializeObject, "cannot serialize object because it is null or undefined", { name: name }, true);
                    return output;
                }
                if (source[circularReferenceCheck]) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.CircularReferenceDetected, "Circular reference detected while serializing object", { name: name }, true);
                    return output;
                }
                if (!source.aiDataContract) {
                    // special case for measurements/properties/tags
                    if (name === "measurements") {
                        output = Serializer._serializeStringMap(source, "number", name);
                    }
                    else if (name === "properties") {
                        output = Serializer._serializeStringMap(source, "string", name);
                    }
                    else if (name === "tags") {
                        output = Serializer._serializeStringMap(source, "string", name);
                    }
                    else if (ApplicationInsights.Util.isArray(source)) {
                        output = Serializer._serializeArray(source, name);
                    }
                    else {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.CannotSerializeObjectNonSerializable, "Attempting to serialize an object which does not implement ISerializable", { name: name }, true);
                        try {
                            // verify that the object can be stringified
                            JSON.stringify(source);
                            output = source;
                        }
                        catch (e) {
                            // if serialization fails return an empty string
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.CannotSerializeObject, (e && typeof e.toString === 'function') ? e.toString() : "Error serializing object", null, true);
                        }
                    }
                    return output;
                }
                source[circularReferenceCheck] = true;
                for (var field in source.aiDataContract) {
                    var contract = source.aiDataContract[field];
                    var isRequired = (typeof contract === "function") ? (contract() & FieldType.Required) : (contract & FieldType.Required);
                    var isHidden = (typeof contract === "function") ? (contract() & FieldType.Hidden) : (contract & FieldType.Hidden);
                    var isArray = contract & FieldType.Array;
                    var isPresent = source[field] !== undefined;
                    var isObject = typeof source[field] === "object" && source[field] !== null;
                    if (isRequired && !isPresent && !isArray) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.MissingRequiredFieldSpecification, "Missing required field specification. The field is required but not present on source", { field: field, name: name });
                        // If not in debug mode, continue and hope the error is permissible
                        continue;
                    }
                    if (isHidden) {
                        // Don't serialize hidden fields
                        continue;
                    }
                    var value;
                    if (isObject) {
                        if (isArray) {
                            // special case; resurse on each object in the source array
                            value = Serializer._serializeArray(source[field], field);
                        }
                        else {
                            // recurse on the source object in this field
                            value = Serializer._serializeObject(source[field], field);
                        }
                    }
                    else {
                        // assign the source field to the output even if undefined or required
                        value = source[field];
                    }
                    // only emit this field if the value is defined
                    if (value !== undefined) {
                        output[field] = value;
                    }
                }
                delete source[circularReferenceCheck];
                return output;
            };
            Serializer._serializeArray = function (sources, name) {
                var output = undefined;
                if (!!sources) {
                    if (!ApplicationInsights.Util.isArray(sources)) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.ItemNotInArray, "This field was specified as an array in the contract but the item is not an array.\r\n", { name: name }, true);
                    }
                    else {
                        output = [];
                        for (var i = 0; i < sources.length; i++) {
                            var source = sources[i];
                            var item = Serializer._serializeObject(source, name + "[" + i + "]");
                            output.push(item);
                        }
                    }
                }
                return output;
            };
            Serializer._serializeStringMap = function (map, expectedType, name) {
                var output = undefined;
                if (map) {
                    output = {};
                    for (var field in map) {
                        var value = map[field];
                        if (expectedType === "string") {
                            if (value === undefined) {
                                output[field] = "undefined";
                            }
                            else if (value === null) {
                                output[field] = "null";
                            }
                            else if (!value.toString) {
                                output[field] = "invalid field: toString() is not defined.";
                            }
                            else {
                                output[field] = value.toString();
                            }
                        }
                        else if (expectedType === "number") {
                            if (value === undefined) {
                                output[field] = "undefined";
                            }
                            else if (value === null) {
                                output[field] = "null";
                            }
                            else {
                                var num = parseFloat(value);
                                if (isNaN(num)) {
                                    output[field] = "NaN";
                                }
                                else {
                                    output[field] = num;
                                }
                            }
                        }
                        else {
                            output[field] = "invalid field: " + name + " is of unknown type.";
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, output[field], null, true);
                        }
                    }
                }
                return output;
            };
            return Serializer;
        }());
        ApplicationInsights.Serializer = Serializer;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
var Microsoft;
(function (Microsoft) {
    var Telemetry;
    (function (Telemetry) {
        "use strict";
        var Base = (function () {
            function Base() {
            }
            return Base;
        }());
        Telemetry.Base = Base;
    })(Telemetry = Microsoft.Telemetry || (Microsoft.Telemetry = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="Base.ts" />
var Microsoft;
(function (Microsoft) {
    var Telemetry;
    (function (Telemetry) {
        "use strict";
        var Envelope = (function () {
            function Envelope() {
                this.ver = 1;
                this.sampleRate = 100.0;
                this.tags = {};
            }
            return Envelope;
        }());
        Telemetry.Envelope = Envelope;
    })(Telemetry = Microsoft.Telemetry || (Microsoft.Telemetry = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../../JavaScriptSDK.Interfaces/Contracts/Generated/Envelope.ts" />
/// <reference path="../../../JavaScriptSDK.Interfaces/Contracts/Generated/Base.ts" />
/// <reference path="../../Util.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            var Common;
            (function (Common) {
                "use strict";
                var Envelope = (function (_super) {
                    __extends(Envelope, _super);
                    /**
                     * Constructs a new instance of telemetry data.
                     */
                    function Envelope(data, name) {
                        var _this = this;
                        _super.call(this);
                        this.name = Common.DataSanitizer.sanitizeString(name) || ApplicationInsights.Util.NotSpecified;
                        this.data = data;
                        this.time = ApplicationInsights.Util.toISOStringForIE8(new Date());
                        this.aiDataContract = {
                            time: ApplicationInsights.FieldType.Required,
                            iKey: ApplicationInsights.FieldType.Required,
                            name: ApplicationInsights.FieldType.Required,
                            sampleRate: function () {
                                return (_this.sampleRate == 100) ? ApplicationInsights.FieldType.Hidden : ApplicationInsights.FieldType.Required;
                            },
                            tags: ApplicationInsights.FieldType.Required,
                            data: ApplicationInsights.FieldType.Required
                        };
                    }
                    return Envelope;
                }(Microsoft.Telemetry.Envelope));
                Common.Envelope = Envelope;
            })(Common = Telemetry.Common || (Telemetry.Common = {}));
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../../JavaScriptSDK.Interfaces/Contracts/Generated/Base.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            var Common;
            (function (Common) {
                "use strict";
                var Base = (function (_super) {
                    __extends(Base, _super);
                    function Base() {
                        _super.apply(this, arguments);
                        /**
                         * The data contract for serializing this object.
                         */
                        this.aiDataContract = {};
                    }
                    return Base;
                }(Microsoft.Telemetry.Base));
                Common.Base = Base;
            })(Common = Telemetry.Common || (Telemetry.Common = {}));
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    var ContextTagKeys = (function () {
        function ContextTagKeys() {
            this.applicationVersion = "ai.application.ver";
            this.applicationBuild = "ai.application.build";
            this.applicationTypeId = "ai.application.typeId";
            this.applicationId = "ai.application.applicationId";
            this.deviceId = "ai.device.id";
            this.deviceIp = "ai.device.ip";
            this.deviceLanguage = "ai.device.language";
            this.deviceLocale = "ai.device.locale";
            this.deviceModel = "ai.device.model";
            this.deviceNetwork = "ai.device.network";
            this.deviceNetworkName = "ai.device.networkName";
            this.deviceOEMName = "ai.device.oemName";
            this.deviceOS = "ai.device.os";
            this.deviceOSVersion = "ai.device.osVersion";
            this.deviceRoleInstance = "ai.device.roleInstance";
            this.deviceRoleName = "ai.device.roleName";
            this.deviceScreenResolution = "ai.device.screenResolution";
            this.deviceType = "ai.device.type";
            this.deviceMachineName = "ai.device.machineName";
            this.deviceVMName = "ai.device.vmName";
            this.locationIp = "ai.location.ip";
            this.operationId = "ai.operation.id";
            this.operationName = "ai.operation.name";
            this.operationParentId = "ai.operation.parentId";
            this.operationRootId = "ai.operation.rootId";
            this.operationSyntheticSource = "ai.operation.syntheticSource";
            this.operationIsSynthetic = "ai.operation.isSynthetic";
            this.operationCorrelationVector = "ai.operation.correlationVector";
            this.sessionId = "ai.session.id";
            this.sessionIsFirst = "ai.session.isFirst";
            this.sessionIsNew = "ai.session.isNew";
            this.userAccountAcquisitionDate = "ai.user.accountAcquisitionDate";
            this.userAccountId = "ai.user.accountId";
            this.userAgent = "ai.user.userAgent";
            this.userId = "ai.user.id";
            this.userStoreRegion = "ai.user.storeRegion";
            this.userAuthUserId = "ai.user.authUserId";
            this.userAnonymousUserAcquisitionDate = "ai.user.anonUserAcquisitionDate";
            this.userAuthenticatedUserAcquisitionDate = "ai.user.authUserAcquisitionDate";
            this.sampleRate = "ai.sample.sampleRate";
            this.cloudName = "ai.cloud.name";
            this.cloudRoleVer = "ai.cloud.roleVer";
            this.cloudEnvironment = "ai.cloud.environment";
            this.cloudLocation = "ai.cloud.location";
            this.cloudDeploymentUnit = "ai.cloud.deploymentUnit";
            this.serverDeviceOS = "ai.serverDevice.os";
            this.serverDeviceOSVer = "ai.serverDevice.osVer";
            this.internalSdkVersion = "ai.internal.sdkVersion";
            this.internalAgentVersion = "ai.internal.agentVersion";
            this.internalDataCollectorReceivedTime = "ai.internal.dataCollectorReceivedTime";
            this.internalProfileId = "ai.internal.profileId";
            this.internalProfileClassId = "ai.internal.profileClassId";
            this.internalAccountId = "ai.internal.accountId";
            this.internalApplicationName = "ai.internal.applicationName";
            this.internalInstrumentationKey = "ai.internal.instrumentationKey";
            this.internalTelemetryItemId = "ai.internal.telemetryItemId";
            this.internalApplicationType = "ai.internal.applicationType";
            this.internalRequestSource = "ai.internal.requestSource";
            this.internalFlowType = "ai.internal.flowType";
            this.internalIsAudit = "ai.internal.isAudit";
            this.internalTrackingSourceId = "ai.internal.trackingSourceId";
            this.internalTrackingType = "ai.internal.trackingType";
            this.internalIsDiagnosticExample = "ai.internal.isDiagnosticExample";
        }
        return ContextTagKeys;
    }());
    AI.ContextTagKeys = ContextTagKeys;
})(AI || (AI = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Context/IApplication.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var Application = (function () {
                function Application() {
                }
                return Application;
            }());
            Context.Application = Application;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Context/IDevice.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var Device = (function () {
                /**
                 * Constructs a new instance of the Device class
                 */
                function Device() {
                    // don't attempt to fingerprint browsers
                    this.id = "browser";
                    // Device type is a dimension in our data platform
                    // Setting it to 'Browser' allows to separate client and server dependencies/exceptions
                    this.type = "Browser";
                }
                return Device;
            }());
            Context.Device = Device;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Context/IInternal.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var Internal = (function () {
                /**
                * Constructs a new instance of the internal telemetry data class.
                */
                function Internal() {
                    this.sdkVersion = "javascript:" + ApplicationInsights.Version;
                    this.agentVersion = ApplicationInsights.SnippetVersion ? "snippet:" + ApplicationInsights.SnippetVersion : undefined;
                }
                return Internal;
            }());
            Context.Internal = Internal;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Context/ILocation.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var Location = (function () {
                function Location() {
                }
                return Location;
            }());
            Context.Location = Location;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../util.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Context/IOperation.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var Operation = (function () {
                function Operation() {
                    this.id = ApplicationInsights.Util.newId();
                    if (window && window.location && window.location.pathname) {
                        this.name = window.location.pathname;
                    }
                }
                return Operation;
            }());
            Context.Operation = Operation;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var HashCodeScoreGenerator = (function () {
            function HashCodeScoreGenerator() {
            }
            HashCodeScoreGenerator.prototype.getHashCodeScore = function (key) {
                var score = this.getHashCode(key) / HashCodeScoreGenerator.INT_MAX_VALUE;
                return score * 100;
            };
            HashCodeScoreGenerator.prototype.getHashCode = function (input) {
                if (input == "") {
                    return 0;
                }
                while (input.length < HashCodeScoreGenerator.MIN_INPUT_LENGTH) {
                    input = input.concat(input);
                }
                // 5381 is a magic number: http://stackoverflow.com/questions/10696223/reason-for-5381-number-in-djb-hash-function
                var hash = 5381;
                for (var i = 0; i < input.length; ++i) {
                    hash = ((hash << 5) + hash) + input.charCodeAt(i);
                    // 'hash' is of number type which means 53 bit integer (http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types-number-type)
                    // 'hash & hash' will keep it 32 bit integer - just to make it clearer what the result is.
                    hash = hash & hash;
                }
                return Math.abs(hash);
            };
            // We're using 32 bit math, hence max value is (2^31 - 1)
            HashCodeScoreGenerator.INT_MAX_VALUE = 2147483647;
            // (Magic number) DJB algorithm can't work on shorter strings (results in poor distribution
            HashCodeScoreGenerator.MIN_INPUT_LENGTH = 8;
            return HashCodeScoreGenerator;
        }());
        ApplicationInsights.HashCodeScoreGenerator = HashCodeScoreGenerator;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="./HashCodeScoreGenerator.ts" />
/// <reference path="../JavaScriptSDK.Interfaces/Contracts/Generated/Envelope.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var SamplingScoreGenerator = (function () {
            function SamplingScoreGenerator() {
                this.hashCodeGeneragor = new ApplicationInsights.HashCodeScoreGenerator();
            }
            SamplingScoreGenerator.prototype.getSamplingScore = function (envelope) {
                var tagKeys = new AI.ContextTagKeys();
                var score = 0;
                if (envelope.tags[tagKeys.userId]) {
                    score = this.hashCodeGeneragor.getHashCodeScore(envelope.tags[tagKeys.userId]);
                }
                else if (envelope.tags[tagKeys.operationId]) {
                    score = this.hashCodeGeneragor.getHashCodeScore(envelope.tags[tagKeys.operationId]);
                }
                else {
                    score = Math.random();
                }
                return score;
            };
            return SamplingScoreGenerator;
        }());
        ApplicationInsights.SamplingScoreGenerator = SamplingScoreGenerator;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../SamplingScoreGenerator.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/Envelope.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Context/ISample.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var Sample = (function () {
                function Sample(sampleRate) {
                    // We're using 32 bit math, hence max value is (2^31 - 1)
                    this.INT_MAX_VALUE = 2147483647;
                    if (sampleRate > 100 || sampleRate < 0) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.SampleRateOutOfRange, "Sampling rate is out of range (0..100). Sampling will be disabled, you may be sending too much data which may affect your AI service level.", { samplingRate: sampleRate }, true);
                        this.sampleRate = 100;
                    }
                    this.sampleRate = sampleRate;
                    this.samplingScoreGenerator = new ApplicationInsights.SamplingScoreGenerator();
                }
                /**
                * Determines if an envelope is sampled in (i.e. will be sent) or not (i.e. will be dropped).
                */
                Sample.prototype.isSampledIn = function (envelope) {
                    if (this.sampleRate == 100)
                        return true;
                    var score = this.samplingScoreGenerator.getSamplingScore(envelope);
                    return score < this.sampleRate;
                };
                return Sample;
            }());
            Context.Sample = Sample;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    (function (SessionState) {
        SessionState[SessionState["Start"] = 0] = "Start";
        SessionState[SessionState["End"] = 1] = "End";
    })(AI.SessionState || (AI.SessionState = {}));
    var SessionState = AI.SessionState;
})(AI || (AI = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../util.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/SessionState.ts"/>
/// <reference path="../../JavaScriptSDK.Interfaces/Context/ISession.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var Session = (function () {
                function Session() {
                }
                return Session;
            }());
            Context.Session = Session;
            var _SessionManager = (function () {
                function _SessionManager(config) {
                    if (!config) {
                        config = {};
                    }
                    if (!(typeof config.sessionExpirationMs === "function")) {
                        config.sessionExpirationMs = function () { return _SessionManager.acquisitionSpan; };
                    }
                    if (!(typeof config.sessionRenewalMs === "function")) {
                        config.sessionRenewalMs = function () { return _SessionManager.renewalSpan; };
                    }
                    this.config = config;
                    this.automaticSession = new Session();
                }
                _SessionManager.prototype.update = function () {
                    if (!this.automaticSession.id) {
                        this.initializeAutomaticSession();
                    }
                    var now = ApplicationInsights.dateTime.Now();
                    var acquisitionExpired = now - this.automaticSession.acquisitionDate > this.config.sessionExpirationMs();
                    var renewalExpired = now - this.automaticSession.renewalDate > this.config.sessionRenewalMs();
                    // renew if acquisitionSpan or renewalSpan has ellapsed
                    if (acquisitionExpired || renewalExpired) {
                        // update automaticSession so session state has correct id                
                        this.automaticSession.isFirst = undefined;
                        this.renew();
                    }
                    else {
                        // do not update the cookie more often than cookieUpdateInterval
                        if (!this.cookieUpdatedTimestamp || now - this.cookieUpdatedTimestamp > _SessionManager.cookieUpdateInterval) {
                            this.automaticSession.renewalDate = now;
                            this.setCookie(this.automaticSession.id, this.automaticSession.acquisitionDate, this.automaticSession.renewalDate);
                        }
                    }
                };
                /**
                 *  Record the current state of the automatic session and store it in our cookie string format
                 *  into the browser's local storage. This is used to restore the session data when the cookie
                 *  expires.
                 */
                _SessionManager.prototype.backup = function () {
                    this.setStorage(this.automaticSession.id, this.automaticSession.acquisitionDate, this.automaticSession.renewalDate);
                };
                /**
                 *  Use ai_session cookie data or local storage data (when the cookie is unavailable) to
                 *  initialize the automatic session.
                 */
                _SessionManager.prototype.initializeAutomaticSession = function () {
                    var cookie = ApplicationInsights.Util.getCookie('ai_session');
                    if (cookie && typeof cookie.split === "function") {
                        this.initializeAutomaticSessionWithData(cookie);
                    }
                    else {
                        // There's no cookie, but we might have session data in local storage
                        // This can happen if the session expired or the user actively deleted the cookie
                        // We only want to recover data if the cookie is missing from expiry. We should respect the user's wishes if the cookie was deleted actively.
                        // The User class handles this for us and deletes our local storage object if the persistent user cookie was removed.
                        var storage = ApplicationInsights.Util.getStorage('ai_session');
                        if (storage) {
                            this.initializeAutomaticSessionWithData(storage);
                        }
                    }
                    if (!this.automaticSession.id) {
                        this.automaticSession.isFirst = true;
                        this.renew();
                    }
                };
                /**
                 *  Extract id, aquisitionDate, and renewalDate from an ai_session payload string and
                 *  use this data to initialize automaticSession.
                 *
                 *  @param {string} sessionData - The string stored in an ai_session cookie or local storage backup
                 */
                _SessionManager.prototype.initializeAutomaticSessionWithData = function (sessionData) {
                    var params = sessionData.split("|");
                    if (params.length > 0) {
                        this.automaticSession.id = params[0];
                    }
                    try {
                        if (params.length > 1) {
                            var acq = +params[1];
                            this.automaticSession.acquisitionDate = +new Date(acq);
                            this.automaticSession.acquisitionDate = this.automaticSession.acquisitionDate > 0 ? this.automaticSession.acquisitionDate : 0;
                        }
                        if (params.length > 2) {
                            var renewal = +params[2];
                            this.automaticSession.renewalDate = +new Date(renewal);
                            this.automaticSession.renewalDate = this.automaticSession.renewalDate > 0 ? this.automaticSession.renewalDate : 0;
                        }
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.ErrorParsingAISessionCookie, "Error parsing ai_session cookie, session will be reset: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                    }
                    if (this.automaticSession.renewalDate == 0) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.SessionRenewalDateIsZero, "AI session renewal date is 0, session will be reset.");
                    }
                };
                _SessionManager.prototype.renew = function () {
                    var now = ApplicationInsights.dateTime.Now();
                    this.automaticSession.id = ApplicationInsights.Util.newId();
                    this.automaticSession.acquisitionDate = now;
                    this.automaticSession.renewalDate = now;
                    this.setCookie(this.automaticSession.id, this.automaticSession.acquisitionDate, this.automaticSession.renewalDate);
                    // If this browser does not support local storage, fire an internal log to keep track of it at this point
                    if (!ApplicationInsights.Util.canUseLocalStorage()) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.BrowserDoesNotSupportLocalStorage, "Browser does not support local storage. Session durations will be inaccurate.");
                    }
                };
                _SessionManager.prototype.setCookie = function (guid, acq, renewal) {
                    // Set cookie to expire after the session expiry time passes or the session renewal deadline, whichever is sooner
                    // Expiring the cookie will cause the session to expire even if the user isn't on the page
                    var acquisitionExpiry = acq + this.config.sessionExpirationMs();
                    var renewalExpiry = renewal + this.config.sessionRenewalMs();
                    var cookieExpiry = new Date();
                    var cookie = [guid, acq, renewal];
                    if (acquisitionExpiry < renewalExpiry) {
                        cookieExpiry.setTime(acquisitionExpiry);
                    }
                    else {
                        cookieExpiry.setTime(renewalExpiry);
                    }
                    var cookieDomnain = this.config.cookieDomain ? this.config.cookieDomain() : null;
                    ApplicationInsights.Util.setCookie('ai_session', cookie.join('|') + ';expires=' + cookieExpiry.toUTCString(), cookieDomnain);
                    this.cookieUpdatedTimestamp = ApplicationInsights.dateTime.Now();
                };
                _SessionManager.prototype.setStorage = function (guid, acq, renewal) {
                    // Keep data in local storage to retain the last session id, allowing us to cleanly end the session when it expires
                    // Browsers that don't support local storage won't be able to end sessions cleanly from the client
                    // The server will notice this and end the sessions itself, with loss of accurate session duration
                    ApplicationInsights.Util.setStorage('ai_session', [guid, acq, renewal].join('|'));
                };
                _SessionManager.acquisitionSpan = 86400000; // 24 hours in ms
                _SessionManager.renewalSpan = 1800000; // 30 minutes in ms
                _SessionManager.cookieUpdateInterval = 60000; // 1 minute in ms
                return _SessionManager;
            }());
            Context._SessionManager = _SessionManager;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../util.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Context/IUser.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Context;
        (function (Context) {
            "use strict";
            var User = (function () {
                function User(config) {
                    //get userId or create new one if none exists
                    var cookie = ApplicationInsights.Util.getCookie(User.userCookieName);
                    if (cookie) {
                        var params = cookie.split(User.cookieSeparator);
                        if (params.length > 0) {
                            this.id = params[0];
                        }
                    }
                    this.config = config;
                    if (!this.id) {
                        this.id = ApplicationInsights.Util.newId();
                        var date = new Date();
                        var acqStr = ApplicationInsights.Util.toISOStringForIE8(date);
                        this.accountAcquisitionDate = acqStr;
                        // without expiration, cookies expire at the end of the session
                        // set it to 365 days from now
                        // 365 * 24 * 60 * 60 * 1000 = 31536000000 
                        date.setTime(date.getTime() + 31536000000);
                        var newCookie = [this.id, acqStr];
                        var cookieDomain = this.config.cookieDomain ? this.config.cookieDomain() : undefined;
                        ApplicationInsights.Util.setCookie(User.userCookieName, newCookie.join(User.cookieSeparator) + ';expires=' + date.toUTCString(), cookieDomain);
                        // If we have an ai_session in local storage this means the user actively removed our cookies.
                        // We should respect their wishes and clear ourselves from local storage
                        ApplicationInsights.Util.removeStorage('ai_session');
                    }
                    // We still take the account id from the ctor param for backward compatibility. 
                    // But if the the customer set the accountId through the newer setAuthenticatedUserContext API, we will override it.
                    this.accountId = config.accountId ? config.accountId() : undefined;
                    // Get the auth user id and account id from the cookie if exists
                    // Cookie is in the pattern: <authenticatedId>|<accountId>
                    var authCookie = ApplicationInsights.Util.getCookie(User.authUserCookieName);
                    if (authCookie) {
                        authCookie = decodeURI(authCookie);
                        var authCookieString = authCookie.split(User.cookieSeparator);
                        if (authCookieString[0]) {
                            this.authenticatedId = authCookieString[0];
                        }
                        if (authCookieString.length > 1 && authCookieString[1]) {
                            this.accountId = authCookieString[1];
                        }
                    }
                }
                /**
                * Sets the autheticated user id and the account id in this session.
                *
                * @param authenticatedUserId {string} - The authenticated user id. A unique and persistent string that represents each authenticated user in the service.
                * @param accountId {string} - An optional string to represent the account associated with the authenticated user.
                */
                User.prototype.setAuthenticatedUserContext = function (authenticatedUserId, accountId) {
                    // Validate inputs to ensure no cookie control characters.
                    var isInvalidInput = !this.validateUserInput(authenticatedUserId) || (accountId && !this.validateUserInput(accountId));
                    if (isInvalidInput) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.SetAuthContextFailedAccountName, "Setting auth user context failed. " +
                            "User auth/account id should be of type string, and not contain commas, semi-colons, equal signs, spaces, or vertical-bars.", true);
                        return;
                    }
                    // Create cookie string.
                    this.authenticatedId = authenticatedUserId;
                    var authCookie = this.authenticatedId;
                    if (accountId) {
                        this.accountId = accountId;
                        authCookie = [this.authenticatedId, this.accountId].join(User.cookieSeparator);
                    }
                    // Set the cookie. No expiration date because this is a session cookie (expires when browser closed).
                    // Encoding the cookie to handle unexpected unicode characters.
                    ApplicationInsights.Util.setCookie(User.authUserCookieName, encodeURI(authCookie), this.config.cookieDomain());
                };
                /**
                 * Clears the authenticated user id and the account id from the user context.
                 * @returns {}
                 */
                User.prototype.clearAuthenticatedUserContext = function () {
                    this.authenticatedId = null;
                    this.accountId = null;
                    ApplicationInsights.Util.deleteCookie(User.authUserCookieName);
                };
                User.prototype.validateUserInput = function (id) {
                    // Validate:
                    // 1. Id is a non-empty string.
                    // 2. It does not contain special characters for cookies.
                    if (typeof id !== 'string' ||
                        !id ||
                        id.match(/,|;|=| |\|/)) {
                        return false;
                    }
                    return true;
                };
                User.cookieSeparator = '|';
                User.userCookieName = 'ai_user';
                User.authUserCookieName = 'ai_authUser';
                return User;
            }());
            Context.User = User;
        })(Context = ApplicationInsights.Context || (ApplicationInsights.Context = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../logging.ts" />
/// <reference path="../util.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        var extensions = (function () {
            function extensions() {
            }
            extensions.IsNullOrUndefined = function (obj) {
                return typeof (obj) === "undefined" || obj === null;
            };
            return extensions;
        }());
        ApplicationInsights.extensions = extensions;
        var stringUtils = (function () {
            function stringUtils() {
            }
            stringUtils.GetLength = function (strObject) {
                var res = 0;
                if (!extensions.IsNullOrUndefined(strObject)) {
                    var stringified = "";
                    try {
                        stringified = strObject.toString();
                    }
                    catch (ex) {
                    }
                    res = stringified.length;
                    res = isNaN(res) ? 0 : res;
                }
                return res;
            };
            return stringUtils;
        }());
        ApplicationInsights.stringUtils = stringUtils;
        var dateTime = (function () {
            function dateTime() {
            }
            ///<summary>Return the number of milliseconds since 1970/01/01 in local timezon</summary>
            dateTime.Now = (window.performance && window.performance.now && window.performance.timing) ?
                function () {
                    return window.performance.now() + window.performance.timing.navigationStart;
                }
                :
                    function () {
                        return new Date().getTime();
                    };
            ///<summary>Gets duration between two timestamps</summary>
            dateTime.GetDuration = function (start, end) {
                var result = null;
                if (start !== 0 && end !== 0 && !extensions.IsNullOrUndefined(start) && !extensions.IsNullOrUndefined(end)) {
                    result = end - start;
                }
                return result;
            };
            return dateTime;
        }());
        ApplicationInsights.dateTime = dateTime;
        var EventHelper = (function () {
            function EventHelper() {
            }
            ///<summary>Binds the specified function to an event, so that the function gets called whenever the event fires on the object</summary>
            ///<param name="obj">Object to which </param>
            ///<param name="eventNameWithoutOn">String that specifies any of the standard DHTML Events without "on" prefix</param>
            ///<param name="handlerRef">Pointer that specifies the function to call when event fires</param>
            ///<returns>True if the function was bound successfully to the event, otherwise false</returns>
            EventHelper.AttachEvent = function (obj, eventNameWithoutOn, handlerRef) {
                var result = false;
                if (!extensions.IsNullOrUndefined(obj)) {
                    if (!extensions.IsNullOrUndefined(obj.attachEvent)) {
                        // IE before version 9                    
                        obj.attachEvent("on" + eventNameWithoutOn, handlerRef);
                        result = true;
                    }
                    else {
                        if (!extensions.IsNullOrUndefined(obj.addEventListener)) {
                            // all browsers except IE before version 9
                            obj.addEventListener(eventNameWithoutOn, handlerRef, false);
                            result = true;
                        }
                    }
                }
                return result;
            };
            EventHelper.DetachEvent = function (obj, eventNameWithoutOn, handlerRef) {
                if (!extensions.IsNullOrUndefined(obj)) {
                    if (!extensions.IsNullOrUndefined(obj.detachEvent)) {
                        obj.detachEvent("on" + eventNameWithoutOn, handlerRef);
                    }
                    else {
                        if (!extensions.IsNullOrUndefined(obj.removeEventListener)) {
                            obj.removeEventListener(eventNameWithoutOn, handlerRef, false);
                        }
                    }
                }
            };
            return EventHelper;
        }());
        ApplicationInsights.EventHelper = EventHelper;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../logging.ts" />
/// <reference path="../util.ts" />
/// <reference path="./ajaxUtils.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        var XHRMonitoringState = (function () {
            function XHRMonitoringState() {
                this.openDone = false;
                this.setRequestHeaderDone = false;
                this.sendDone = false;
                this.abortDone = false;
                //<summary>True, if onreadyStateChangeCallback function attached to xhr, otherwise false</summary>
                this.onreadystatechangeCallbackAttached = false;
            }
            return XHRMonitoringState;
        }());
        ApplicationInsights.XHRMonitoringState = XHRMonitoringState;
        var ajaxRecord = (function () {
            function ajaxRecord(id) {
                this.completed = false;
                this.requestHeadersSize = null;
                this.ttfb = null;
                this.responseReceivingDuration = null;
                this.callbackDuration = null;
                this.ajaxTotalDuration = null;
                this.aborted = null;
                this.pageUrl = null;
                this.requestUrl = null;
                this.requestSize = 0;
                this.method = null;
                ///<summary>Returns the HTTP status code.</summary>
                this.status = null;
                //<summary>The timestamp when open method was invoked</summary>
                this.requestSentTime = null;
                //<summary>The timestamps when first byte was received</summary>
                this.responseStartedTime = null;
                //<summary>The timestamp when last byte was received</summary>
                this.responseFinishedTime = null;
                //<summary>The timestamp when onreadystatechange callback in readyState 4 finished</summary>
                this.callbackFinishedTime = null;
                //<summary>The timestamp at which ajax was ended</summary>
                this.endTime = null;
                //<summary>The original xhr onreadystatechange event</summary>
                this.originalOnreadystatechage = null;
                this.xhrMonitoringState = new XHRMonitoringState();
                //<summary>Determines whether or not JavaScript exception occured in xhr.onreadystatechange code. 1 if occured, otherwise 0.</summary>
                this.clientFailure = 0;
                this.CalculateMetrics = function () {
                    var self = this;
                    // round to 3 decimal points
                    self.ajaxTotalDuration = Math.round(ApplicationInsights.dateTime.GetDuration(self.requestSentTime, self.responseFinishedTime) * 1000) / 1000;
                };
                this.id = id;
            }
            ajaxRecord.prototype.getAbsoluteUrl = function () {
                return this.requestUrl ? ApplicationInsights.UrlHelper.getAbsoluteUrl(this.requestUrl) : null;
            };
            ajaxRecord.prototype.getPathName = function () {
                return this.requestUrl ? ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeUrl(ApplicationInsights.UrlHelper.getCompleteUrl(this.method, this.requestUrl)) : null;
            };
            return ajaxRecord;
        }());
        ApplicationInsights.ajaxRecord = ajaxRecord;
        ;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
;
/// <reference path="../logging.ts" />
/// <reference path="../util.ts" />
/// <reference path="./ajaxUtils.ts" />
/// <reference path="./ajaxRecord.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        var AjaxMonitor = (function () {
            function AjaxMonitor(appInsights) {
                this.currentWindowHost = window.location.hostname;
                this.appInsights = appInsights;
                this.initialized = false;
                this.Init();
            }
            ///<summary>The main function that needs to be called in order to start Ajax Monitoring</summary>
            AjaxMonitor.prototype.Init = function () {
                if (this.supportsMonitoring()) {
                    this.instrumentOpen();
                    this.instrumentSend();
                    this.instrumentAbort();
                    this.initialized = true;
                }
            };
            ///<summary>Verifies that particalar instance of XMLHttpRequest needs to be monitored</summary>
            ///<param name="excludeAjaxDataValidation">Optional parameter. True if ajaxData must be excluded from verification</param>
            ///<returns type="bool">True if instance needs to be monitored, otherwise false</returns>
            AjaxMonitor.prototype.isMonitoredInstance = function (xhr, excludeAjaxDataValidation) {
                // checking to see that all interested functions on xhr were instrumented
                return this.initialized
                    && (excludeAjaxDataValidation === true || !ApplicationInsights.extensions.IsNullOrUndefined(xhr.ajaxData))
                    && xhr[AjaxMonitor.DisabledPropertyName] !== true;
            };
            ///<summary>Determines whether ajax monitoring can be enabled on this document</summary>
            ///<returns>True if Ajax monitoring is supported on this page, otherwise false</returns>
            AjaxMonitor.prototype.supportsMonitoring = function () {
                var result = false;
                if (!ApplicationInsights.extensions.IsNullOrUndefined(XMLHttpRequest)) {
                    result = true;
                }
                return result;
            };
            AjaxMonitor.prototype.instrumentOpen = function () {
                var originalOpen = XMLHttpRequest.prototype.open;
                var ajaxMonitorInstance = this;
                XMLHttpRequest.prototype.open = function (method, url, async) {
                    try {
                        if (ajaxMonitorInstance.isMonitoredInstance(this, true) &&
                            (!this.ajaxData ||
                                !this.ajaxData.xhrMonitoringState.openDone)) {
                            ajaxMonitorInstance.openHandler(this, method, url, async);
                        }
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.FailedMonitorAjaxOpen, "Failed to monitor XMLHttpRequest.open, monitoring data for this ajax call may be incorrect.", {
                            ajaxDiagnosticsMessage: AjaxMonitor.getFailedAjaxDiagnosticsMessage(this),
                            exception: Microsoft.ApplicationInsights.Util.dump(e)
                        });
                    }
                    return originalOpen.apply(this, arguments);
                };
            };
            AjaxMonitor.prototype.openHandler = function (xhr, method, url, async) {
                var ajaxData = new ApplicationInsights.ajaxRecord(ApplicationInsights.Util.newId());
                ajaxData.method = method;
                ajaxData.requestUrl = url;
                ajaxData.xhrMonitoringState.openDone = true;
                xhr.ajaxData = ajaxData;
                this.attachToOnReadyStateChange(xhr);
            };
            AjaxMonitor.getFailedAjaxDiagnosticsMessage = function (xhr) {
                var result = "";
                try {
                    if (!ApplicationInsights.extensions.IsNullOrUndefined(xhr) &&
                        !ApplicationInsights.extensions.IsNullOrUndefined(xhr.ajaxData) &&
                        !ApplicationInsights.extensions.IsNullOrUndefined(xhr.ajaxData.requestUrl)) {
                        result += "(url: '" + xhr.ajaxData.requestUrl + "')";
                    }
                }
                catch (e) { }
                return result;
            };
            AjaxMonitor.prototype.instrumentSend = function () {
                var originalSend = XMLHttpRequest.prototype.send;
                var ajaxMonitorInstance = this;
                XMLHttpRequest.prototype.send = function (content) {
                    try {
                        if (ajaxMonitorInstance.isMonitoredInstance(this) && !this.ajaxData.xhrMonitoringState.sendDone) {
                            ajaxMonitorInstance.sendHandler(this, content);
                        }
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.FailedMonitorAjaxSend, "Failed to monitor XMLHttpRequest, monitoring data for this ajax call may be incorrect.", {
                            ajaxDiagnosticsMessage: AjaxMonitor.getFailedAjaxDiagnosticsMessage(this),
                            exception: Microsoft.ApplicationInsights.Util.dump(e)
                        });
                    }
                    return originalSend.apply(this, arguments);
                };
            };
            AjaxMonitor.prototype.sendHandler = function (xhr, content) {
                xhr.ajaxData.requestSentTime = ApplicationInsights.dateTime.Now();
                // Add correlation headers only for requests within the same domain (ignore the port number)
                // For cross- origin requests we need to ensure that x- ms -* headers are present in `Access-Control-Allow-Headers` header (OPTIONS response)
                if (!this.appInsights.config.disableCorrelationHeaders && (ApplicationInsights.UrlHelper.parseUrl(xhr.ajaxData.getAbsoluteUrl()).hostname == this.currentWindowHost)) {
                    var rootId = this.appInsights.context.operation.id;
                    xhr.setRequestHeader("x-ms-request-root-id", rootId);
                    xhr.setRequestHeader("x-ms-request-id", xhr.ajaxData.id);
                }
                xhr.ajaxData.xhrMonitoringState.sendDone = true;
            };
            AjaxMonitor.prototype.instrumentAbort = function () {
                var originalAbort = XMLHttpRequest.prototype.abort;
                var ajaxMonitorInstance = this;
                XMLHttpRequest.prototype.abort = function () {
                    try {
                        if (ajaxMonitorInstance.isMonitoredInstance(this) && !this.ajaxData.xhrMonitoringState.abortDone) {
                            this.ajaxData.aborted = 1;
                            this.ajaxData.xhrMonitoringState.abortDone = true;
                        }
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.FailedMonitorAjaxAbort, "Failed to monitor XMLHttpRequest.abort, monitoring data for this ajax call may be incorrect.", {
                            ajaxDiagnosticsMessage: AjaxMonitor.getFailedAjaxDiagnosticsMessage(this),
                            exception: Microsoft.ApplicationInsights.Util.dump(e)
                        });
                    }
                    return originalAbort.apply(this, arguments);
                };
            };
            AjaxMonitor.prototype.attachToOnReadyStateChange = function (xhr) {
                var ajaxMonitorInstance = this;
                xhr.ajaxData.xhrMonitoringState.onreadystatechangeCallbackAttached = ApplicationInsights.EventHelper.AttachEvent(xhr, "readystatechange", function () {
                    try {
                        if (ajaxMonitorInstance.isMonitoredInstance(xhr)) {
                            if (xhr.readyState === 4) {
                                ajaxMonitorInstance.onAjaxComplete(xhr);
                            }
                        }
                    }
                    catch (e) {
                        var exceptionText = Microsoft.ApplicationInsights.Util.dump(e);
                        // ignore messages with c00c023f, as this a known IE9 XHR abort issue
                        if (!exceptionText || exceptionText.toLowerCase().indexOf("c00c023f") == -1) {
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.FailedMonitorAjaxRSC, "Failed to monitor XMLHttpRequest 'readystatechange' event handler, monitoring data for this ajax call may be incorrect.", {
                                ajaxDiagnosticsMessage: AjaxMonitor.getFailedAjaxDiagnosticsMessage(xhr),
                                exception: Microsoft.ApplicationInsights.Util.dump(e)
                            });
                        }
                    }
                });
            };
            AjaxMonitor.prototype.onAjaxComplete = function (xhr) {
                xhr.ajaxData.responseFinishedTime = ApplicationInsights.dateTime.Now();
                xhr.ajaxData.status = xhr.status;
                xhr.ajaxData.CalculateMetrics();
                if (xhr.ajaxData.ajaxTotalDuration < 0) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.FailedMonitorAjaxDur, "Failed to calculate the duration of the ajax call, monitoring data for this ajax call won't be sent.", {
                        ajaxDiagnosticsMessage: AjaxMonitor.getFailedAjaxDiagnosticsMessage(xhr),
                        requestSentTime: xhr.ajaxData.requestSentTime,
                        responseFinishedTime: xhr.ajaxData.responseFinishedTime
                    });
                }
                else {
                    this.appInsights.trackDependency(xhr.ajaxData.id, xhr.ajaxData.method, xhr.ajaxData.getAbsoluteUrl(), xhr.ajaxData.getPathName(), xhr.ajaxData.ajaxTotalDuration, (+(xhr.ajaxData.status)) >= 200 && (+(xhr.ajaxData.status)) < 400, +xhr.ajaxData.status);
                    xhr.ajaxData = null;
                }
            };
            AjaxMonitor.instrumentedByAppInsightsName = "InstrumentedByAppInsights";
            ///<summary>Function that returns property name which will identify that monitoring for given instance of XmlHttpRequest is disabled</summary>
            AjaxMonitor.DisabledPropertyName = "Microsoft_ApplicationInsights_BypassAjaxInstrumentation";
            return AjaxMonitor;
        }());
        ApplicationInsights.AjaxMonitor = AjaxMonitor;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="serializer.ts" />
/// <reference path="Telemetry/Common/Envelope.ts"/>
/// <reference path="Telemetry/Common/Base.ts" />
/// <reference path="../JavaScriptSDK.Interfaces/Contracts/Generated/ContextTagKeys.ts"/>
/// <reference path="Context/Application.ts"/>
/// <reference path="Context/Device.ts"/>
/// <reference path="Context/Internal.ts"/>
/// <reference path="Context/Location.ts"/>
/// <reference path="Context/Operation.ts"/>
/// <reference path="Context/Sample.ts"/>
/// <reference path="Context/Session.ts"/>
/// <reference path="Context/User.ts"/>
/// <reference path="ajax/ajax.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        /*
         * An array based send buffer.
         */
        var ArraySendBuffer = (function () {
            function ArraySendBuffer(config) {
                this._config = config;
                this._buffer = [];
            }
            ArraySendBuffer.prototype.enqueue = function (payload) {
                this._buffer.push(payload);
            };
            ArraySendBuffer.prototype.count = function () {
                return this._buffer.length;
            };
            ArraySendBuffer.prototype.clear = function () {
                this._buffer.length = 0;
            };
            ArraySendBuffer.prototype.getItems = function () {
                return this._buffer.slice(0);
            };
            ArraySendBuffer.prototype.batchPayloads = function (payload) {
                if (payload && payload.length > 0) {
                    var batch = this._config.emitLineDelimitedJson() ?
                        payload.join("\n") :
                        "[" + payload.join(",") + "]";
                    return batch;
                }
                return null;
            };
            ArraySendBuffer.prototype.markAsSent = function (payload) {
                this.clear();
            };
            ArraySendBuffer.prototype.clearSent = function (payload) {
                // not supported
            };
            return ArraySendBuffer;
        }());
        ApplicationInsights.ArraySendBuffer = ArraySendBuffer;
        /*
         * Session storege buffer holds a copy of all unsent items in the browser session storage.
         */
        var SessionStorageSendBuffer = (function () {
            function SessionStorageSendBuffer(config) {
                this._bufferFullMessageSent = false;
                this._config = config;
                var bufferItems = this.getBuffer(SessionStorageSendBuffer.BUFFER_KEY);
                var notDeliveredItems = this.getBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY);
                this._buffer = bufferItems.concat(notDeliveredItems);
                // If the buffer has too many items, drop items from the end.
                if (this._buffer.length > SessionStorageSendBuffer.MAX_BUFFER_SIZE) {
                    this._buffer.length = SessionStorageSendBuffer.MAX_BUFFER_SIZE;
                }
                // update DataLossAnalyzer with the number of recovered items
                // Uncomment if you want to use DataLossanalyzer
                // DataLossAnalyzer.itemsRestoredFromSessionBuffer = this._buffer.length;
                this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, []);
                this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, this._buffer);
            }
            SessionStorageSendBuffer.prototype.enqueue = function (payload) {
                if (this._buffer.length >= SessionStorageSendBuffer.MAX_BUFFER_SIZE) {
                    // sent internal log only once per page view
                    if (!this._bufferFullMessageSent) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.SessionStorageBufferFull, "Maximum buffer size reached: " + this._buffer.length, true);
                        this._bufferFullMessageSent = true;
                    }
                    return;
                }
                this._buffer.push(payload);
                this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, this._buffer);
            };
            SessionStorageSendBuffer.prototype.count = function () {
                return this._buffer.length;
            };
            SessionStorageSendBuffer.prototype.clear = function () {
                this._buffer.length = 0;
                this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, []);
                this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, []);
                this._bufferFullMessageSent = false;
            };
            SessionStorageSendBuffer.prototype.getItems = function () {
                return this._buffer.slice(0);
            };
            SessionStorageSendBuffer.prototype.batchPayloads = function (payload) {
                if (payload && payload.length > 0) {
                    var batch = this._config.emitLineDelimitedJson() ?
                        payload.join("\n") :
                        "[" + payload.join(",") + "]";
                    return batch;
                }
                return null;
            };
            SessionStorageSendBuffer.prototype.markAsSent = function (payload) {
                this._buffer = this.removePayloadsFromBuffer(payload, this._buffer);
                this.setBuffer(SessionStorageSendBuffer.BUFFER_KEY, this._buffer);
                var sentElements = this.getBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY);
                if (sentElements instanceof Array && payload instanceof Array) {
                    sentElements = sentElements.concat(payload);
                    if (sentElements.length > SessionStorageSendBuffer.MAX_BUFFER_SIZE) {
                        // We send telemetry normally. If the SENT_BUFFER is too big we don't add new elements
                        // until we receive a response from the backend and the buffer has free space again (see clearSent method)
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.SessionStorageBufferFull, "Sent buffer reached its maximum size: " + sentElements.length, true);
                        sentElements.length = SessionStorageSendBuffer.MAX_BUFFER_SIZE;
                    }
                    this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, sentElements);
                }
            };
            SessionStorageSendBuffer.prototype.clearSent = function (payload) {
                var sentElements = this.getBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY);
                sentElements = this.removePayloadsFromBuffer(payload, sentElements);
                this.setBuffer(SessionStorageSendBuffer.SENT_BUFFER_KEY, sentElements);
            };
            SessionStorageSendBuffer.prototype.removePayloadsFromBuffer = function (payloads, buffer) {
                var remaining = [];
                for (var i in buffer) {
                    var contains = false;
                    for (var j in payloads) {
                        if (payloads[j] === buffer[i]) {
                            contains = true;
                            break;
                        }
                    }
                    if (!contains) {
                        remaining.push(buffer[i]);
                    }
                }
                ;
                return remaining;
            };
            SessionStorageSendBuffer.prototype.getBuffer = function (key) {
                try {
                    var bufferJson = ApplicationInsights.Util.getSessionStorage(key);
                    if (bufferJson) {
                        var buffer = JSON.parse(bufferJson);
                        if (buffer) {
                            return buffer;
                        }
                    }
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.FailedToRestoreStorageBuffer, " storage key: " + key + ", " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
                return [];
            };
            SessionStorageSendBuffer.prototype.setBuffer = function (key, buffer) {
                try {
                    var bufferJson = JSON.stringify(buffer);
                    ApplicationInsights.Util.setSessionStorage(key, bufferJson);
                }
                catch (e) {
                    // if there was an error, clear the buffer
                    // telemetry is stored in the _buffer array so we won't loose any items
                    ApplicationInsights.Util.setSessionStorage(key, JSON.stringify([]));
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.FailedToSetStorageBuffer, " storage key: " + key + ", " + ApplicationInsights.Util.getExceptionName(e) + ". Buffer cleared", { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            SessionStorageSendBuffer.BUFFER_KEY = "AI_buffer";
            SessionStorageSendBuffer.SENT_BUFFER_KEY = "AI_sentBuffer";
            // Maximum number of payloads stored in the buffer. If the buffer is full, new elements will be dropped. 
            SessionStorageSendBuffer.MAX_BUFFER_SIZE = 2000;
            return SessionStorageSendBuffer;
        }());
        ApplicationInsights.SessionStorageSendBuffer = SessionStorageSendBuffer;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="serializer.ts" />
/// <reference path="Telemetry/Common/Envelope.ts"/>
/// <reference path="Telemetry/Common/Base.ts" />
/// <reference path="../JavaScriptSDK.Interfaces/Contracts/Generated/ContextTagKeys.ts"/>
/// <reference path="../JavaScriptSDK.Interfaces/Contracts/Generated/Envelope.ts" />
/// <reference path="Context/Application.ts"/>
/// <reference path="Context/Device.ts"/>
/// <reference path="Context/Internal.ts"/>
/// <reference path="Context/Location.ts"/>
/// <reference path="Context/Operation.ts"/>
/// <reference path="Context/Sample.ts"/>
/// <reference path="Context/Session.ts"/>
/// <reference path="Context/User.ts"/>
/// <reference path="ajax/ajax.ts"/>
/// <reference path="SendBuffer.ts"/>
;
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        var Sender = (function () {
            /**
             * Constructs a new instance of the Sender class
             */
            function Sender(config) {
                /**
                 * Whether XMLHttpRequest object is supported. Older version of IE (8,9) do not support it.
                 */
                this._XMLHttpRequestSupported = false;
                this._consecutiveErrors = 0;
                this._retryAt = null;
                this._lastSend = 0;
                this._config = config;
                this._sender = null;
                this._buffer = (ApplicationInsights.Util.canUseSessionStorage() && this._config.enableSessionStorageBuffer())
                    ? new ApplicationInsights.SessionStorageSendBuffer(config) : new ApplicationInsights.ArraySendBuffer(config);
                if (!this._config.isBeaconApiDisabled() && ApplicationInsights.Util.IsBeaconApiSupported()) {
                    this._sender = this._beaconSender;
                }
                else {
                    if (typeof XMLHttpRequest != "undefined") {
                        var testXhr = new XMLHttpRequest();
                        if ("withCredentials" in testXhr) {
                            this._sender = this._xhrSender;
                            this._XMLHttpRequestSupported = true;
                        }
                        else if (typeof XDomainRequest !== "undefined") {
                            this._sender = this._xdrSender; //IE 8 and 9
                        }
                    }
                }
            }
            /**
             * Add a telemetry item to the send buffer
             */
            Sender.prototype.send = function (envelope) {
                try {
                    // if master off switch is set, don't send any data
                    if (this._config.disableTelemetry()) {
                        // Do not send/save data
                        return;
                    }
                    // validate input
                    if (!envelope) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.CannotSendEmptyTelemetry, "Cannot send empty telemetry");
                        return;
                    }
                    // ensure a sender was constructed
                    if (!this._sender) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.SenderNotInitialized, "Sender was not initialized");
                        return;
                    }
                    // check if the incoming payload is too large, truncate if necessary
                    var payload = ApplicationInsights.Serializer.serialize(envelope);
                    // flush if we would exceed the max-size limit by adding this item
                    var bufferPayload = this._buffer.getItems();
                    var batch = this._buffer.batchPayloads(bufferPayload);
                    if (batch && (batch.length + payload.length > this._config.maxBatchSizeInBytes())) {
                        this.triggerSend();
                    }
                    // enqueue the payload
                    this._buffer.enqueue(payload);
                    // ensure an invocation timeout is set
                    this._setupTimer();
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.FailedAddingTelemetryToBuffer, "Failed adding telemetry to the sender's buffer, some telemetry will be lost: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Sets up the timer which triggers actually sending the data.
             */
            Sender.prototype._setupTimer = function () {
                var _this = this;
                if (!this._timeoutHandle) {
                    var retryInterval = this._retryAt ? Math.max(0, this._retryAt - Date.now()) : 0;
                    var timerValue = Math.max(this._config.maxBatchInterval(), retryInterval);
                    this._timeoutHandle = setTimeout(function () {
                        _this.triggerSend();
                    }, timerValue);
                }
            };
            /**
             * Gets the size of the list in bytes.
             * @param list {string[]} - The list to get the size in bytes of.
             */
            Sender.prototype._getSizeInBytes = function (list) {
                var size = 0;
                if (list && list.length) {
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        if (item && item.length) {
                            size += item.length;
                        }
                    }
                }
                return size;
            };
            /**
             * Immediately send buffered data
             * @param async {boolean} - Indicates if the events should be sent asynchronously (Optional, Defaults to true)
             */
            Sender.prototype.triggerSend = function (async) {
                // We are async by default
                var isAsync = true;
                // Respect the parameter passed to the func
                if (typeof async === 'boolean') {
                    isAsync = async;
                }
                try {
                    // Send data only if disableTelemetry is false
                    if (!this._config.disableTelemetry()) {
                        if (this._buffer.count() > 0) {
                            var payload = this._buffer.getItems();
                            // invoke send
                            this._sender(payload, isAsync);
                        }
                        // update lastSend time to enable throttling
                        this._lastSend = +new Date;
                    }
                    else {
                        this._buffer.clear();
                    }
                    clearTimeout(this._timeoutHandle);
                    this._timeoutHandle = null;
                    this._retryAt = null;
                }
                catch (e) {
                    /* Ignore this error for IE under v10 */
                    if (!ApplicationInsights.Util.getIEVersion() || ApplicationInsights.Util.getIEVersion() > 9) {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TransmissionFailed, "Telemetry transmission failed, some telemetry will be lost: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                    }
                }
            };
            /** Calculates the time to wait before retrying in case of an error based on
             * http://en.wikipedia.org/wiki/Exponential_backoff
             */
            Sender.prototype._setRetryTime = function () {
                var SlotDelayInSeconds = 10;
                var delayInSeconds;
                if (this._consecutiveErrors <= 1) {
                    delayInSeconds = SlotDelayInSeconds;
                }
                else {
                    var backOffSlot = (Math.pow(2, this._consecutiveErrors) - 1) / 2;
                    var backOffDelay = Math.floor(Math.random() * backOffSlot * SlotDelayInSeconds) + 1;
                    delayInSeconds = Math.max(Math.min(backOffDelay, 3600), SlotDelayInSeconds);
                }
                // TODO: Log the backoff time like the C# version does.
                var retryAfterTimeSpan = Date.now() + (delayInSeconds * 1000);
                // TODO: Log the retry at time like the C# version does.
                this._retryAt = retryAfterTimeSpan;
            };
            /**
             * Parses the response from the backend.
             * @param response - XMLHttpRequest or XDomainRequest response
             */
            Sender.prototype._parseResponse = function (response) {
                try {
                    var result = JSON.parse(response);
                    if (result && result.itemsReceived && result.itemsReceived >= result.itemsAccepted &&
                        result.itemsReceived - result.itemsAccepted == result.errors.length) {
                        return result;
                    }
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.InvalidBackendResponse, "Cannot parse the response. " + ApplicationInsights.Util.getExceptionName(e));
                }
                return null;
            };
            /**
             * Checks if the SDK should resend the payload after receiving this status code from the backend.
             * @param statusCode
             */
            Sender.prototype._isRetriable = function (statusCode) {
                return statusCode == 408 // Timeout
                    || statusCode == 429 // Too many requests.
                    || statusCode == 500 // Internal server error.
                    || statusCode == 503; // Service unavailable.
            };
            /**
             * Resend payload. Adds payload back to the send buffer and setup a send timer (with exponential backoff).
             * @param payload
             */
            Sender.prototype._resendPayload = function (payload) {
                if (!payload || payload.length === 0) {
                    return;
                }
                this._buffer.clearSent(payload);
                this._consecutiveErrors++;
                for (var _i = 0, payload_1 = payload; _i < payload_1.length; _i++) {
                    var item = payload_1[_i];
                    this._buffer.enqueue(item);
                }
                // setup timer
                this._setRetryTime();
                this._setupTimer();
            };
            /**
             * Send XMLHttpRequest
             * @param payload {string} - The data payload to be sent.
             * @param isAsync {boolean} - Indicates if the request should be sent asynchronously
             */
            Sender.prototype._xhrSender = function (payload, isAsync) {
                var _this = this;
                var xhr = new XMLHttpRequest();
                xhr[ApplicationInsights.AjaxMonitor.DisabledPropertyName] = true;
                xhr.open("POST", this._config.endpointUrl(), isAsync);
                xhr.setRequestHeader("Content-type", "application/json");
                xhr.onreadystatechange = function () { return _this._xhrReadyStateChange(xhr, payload, payload.length); };
                xhr.onerror = function (event) { return _this._onError(payload, xhr.responseText || xhr.response || "", event); };
                // compose an array of payloads
                var batch = this._buffer.batchPayloads(payload);
                xhr.send(batch);
                this._buffer.markAsSent(payload);
            };
            /**
             * Send XDomainRequest
             * @param payload {string} - The data payload to be sent.
             * @param isAsync {boolean} - Indicates if the request should be sent asynchronously
             *
             * Note: XDomainRequest does not support sync requests. This 'isAsync' parameter is added
             * to maintain consistency with the xhrSender's contract
             */
            Sender.prototype._xdrSender = function (payload, isAsync) {
                var _this = this;
                var xdr = new XDomainRequest();
                xdr.onload = function () { return _this._xdrOnLoad(xdr, payload); };
                xdr.onerror = function (event) { return _this._onError(payload, xdr.responseText || "", event); };
                // XDomainRequest requires the same protocol as the hosting page. 
                // If the protocol doesn't match, we can't send the telemetry :(. 
                var hostingProtocol = window.location.protocol;
                if (this._config.endpointUrl().lastIndexOf(hostingProtocol, 0) !== 0) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.TransmissionFailed, ". " +
                        "Cannot send XDomain request. The endpoint URL protocol doesn't match the hosting page protocol.");
                    this._buffer.clear();
                    return;
                }
                var endpointUrl = this._config.endpointUrl().replace(/^(https?:)/, "");
                xdr.open('POST', endpointUrl);
                // compose an array of payloads
                var batch = this._buffer.batchPayloads(payload);
                xdr.send(batch);
                this._buffer.markAsSent(payload);
            };
            /**
             * Send Beacon API request
             * @param payload {string} - The data payload to be sent.
             * @param isAsync {boolean} - not used
             */
            Sender.prototype._beaconSender = function (payload, isAsync) {
                var url = this._config.endpointUrl();
                var batch = this._buffer.batchPayloads(payload);
                // The sendBeacon method returns true if the user agent is able to successfully queue the data for transfer. Otherwise it returns false.
                var queued = navigator.sendBeacon(url, batch);
                if (queued) {
                    this._buffer.markAsSent(payload);
                }
                else {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TransmissionFailed, ". " + "Failed to send telemetry with Beacon API.");
                }
            };
            /**
             * xhr state changes
             */
            Sender.prototype._xhrReadyStateChange = function (xhr, payload, countOfItemsInPayload) {
                if (xhr.readyState === 4) {
                    if ((xhr.status < 200 || xhr.status >= 300) && xhr.status !== 0) {
                        if (!this._config.isRetryDisabled() && this._isRetriable(xhr.status)) {
                            this._resendPayload(payload);
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.TransmissionFailed, ". " +
                                "Response code " + xhr.status + ". Will retry to send " + payload.length + " items.");
                        }
                        else {
                            this._onError(payload, xhr.responseText || xhr.response || "");
                        }
                    }
                    else {
                        if (xhr.status === 206) {
                            var response = this._parseResponse(xhr.responseText || xhr.response);
                            if (response && !this._config.isRetryDisabled()) {
                                this._onPartialSuccess(payload, response);
                            }
                            else {
                                this._onError(payload, xhr.responseText || xhr.response || "");
                            }
                        }
                        else {
                            this._consecutiveErrors = 0;
                            this._onSuccess(payload, countOfItemsInPayload);
                        }
                    }
                }
            };
            /**
             * xdr state changes
             */
            Sender.prototype._xdrOnLoad = function (xdr, payload) {
                if (xdr && (xdr.responseText + "" === "200" || xdr.responseText === "")) {
                    this._consecutiveErrors = 0;
                    this._onSuccess(payload, 0);
                }
                else {
                    var results = this._parseResponse(xdr.responseText);
                    if (results && results.itemsReceived && results.itemsReceived > results.itemsAccepted
                        && !this._config.isRetryDisabled()) {
                        this._onPartialSuccess(payload, results);
                    }
                    else {
                        this._onError(payload, xdr && xdr.responseText || "");
                    }
                }
            };
            /**
             * partial success handler
             */
            Sender.prototype._onPartialSuccess = function (payload, results) {
                var failed = [];
                var retry = [];
                // Iterate through the reversed array of errors so that splicing doesn't have invalid indexes after the first item.
                var errors = results.errors.reverse();
                for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
                    var error = errors_1[_i];
                    var extracted = payload.splice(error.index, 1)[0];
                    if (this._isRetriable(error.statusCode)) {
                        retry.push(extracted);
                    }
                    else {
                        // All other errors, including: 402 (Monthly quota exceeded) and 439 (Too many requests and refresh cache).
                        failed.push(extracted);
                    }
                }
                if (payload.length > 0) {
                    this._onSuccess(payload, results.itemsAccepted);
                }
                if (failed.length > 0) {
                    this._onError(failed, ['partial success', results.itemsAccepted, 'of', results.itemsReceived].join(' '));
                }
                if (retry.length > 0) {
                    this._resendPayload(retry);
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.TransmissionFailed, "Partial success. " +
                        "Delivered: " + payload.length + ", Failed: " + failed.length +
                        ". Will retry to send " + retry.length + " our of " + results.itemsReceived + " items");
                }
            };
            /**
             * error handler
             */
            Sender.prototype._onError = function (payload, message, event) {
                ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.OnError, "Failed to send telemetry.", { message: message });
                this._buffer.clearSent(payload);
            };
            /**
             * success handler
             */
            Sender.prototype._onSuccess = function (payload, countOfItemsInPayload) {
                // Uncomment if you want to use DataLossanalyzer
                // DataLossAnalyzer.decrementItemsQueued(countOfItemsInPayload);
                this._buffer.clearSent(payload);
            };
            /**
             * The maximum Beacon API payload size.
             * WC3 documentation allows browsers to set the limit. Chrome current has a limit of 64kb.
             */
            Sender.MaxBeaconPayloadSize = 65536; // 64kb
            return Sender;
        }());
        ApplicationInsights.Sender = Sender;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
var Microsoft;
(function (Microsoft) {
    var Telemetry;
    (function (Telemetry) {
        "use strict";
        var Domain = (function () {
            function Domain() {
            }
            return Domain;
        }());
        Telemetry.Domain = Domain;
    })(Telemetry = Microsoft.Telemetry || (Microsoft.Telemetry = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    (function (SeverityLevel) {
        SeverityLevel[SeverityLevel["Verbose"] = 0] = "Verbose";
        SeverityLevel[SeverityLevel["Information"] = 1] = "Information";
        SeverityLevel[SeverityLevel["Warning"] = 2] = "Warning";
        SeverityLevel[SeverityLevel["Error"] = 3] = "Error";
        SeverityLevel[SeverityLevel["Critical"] = 4] = "Critical";
    })(AI.SeverityLevel || (AI.SeverityLevel = {}));
    var SeverityLevel = AI.SeverityLevel;
})(AI || (AI = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="Domain.ts" />
/// <reference path="SeverityLevel.ts" />
var AI;
(function (AI) {
    "use strict";
    var MessageData = (function (_super) {
        __extends(MessageData, _super);
        function MessageData() {
            _super.call(this);
            this.ver = 2;
            this.properties = {};
            _super.call(this);
        }
        return MessageData;
    }(Microsoft.Telemetry.Domain));
    AI.MessageData = MessageData;
})(AI || (AI = {}));
/// <reference path="../../logging.ts" />
/// <reference path="../../Util.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            var Common;
            (function (Common) {
                "use strict";
                var DataSanitizer = (function () {
                    function DataSanitizer() {
                    }
                    DataSanitizer.sanitizeKeyAndAddUniqueness = function (key, map) {
                        var origLength = key.length;
                        var field = DataSanitizer.sanitizeKey(key);
                        // validation truncated the length.  We need to add uniqueness
                        if (field.length !== origLength) {
                            var i = 0;
                            var uniqueField = field;
                            while (map[uniqueField] !== undefined) {
                                i++;
                                uniqueField = field.substring(0, DataSanitizer.MAX_NAME_LENGTH - 3) + DataSanitizer.padNumber(i);
                            }
                            field = uniqueField;
                        }
                        return field;
                    };
                    DataSanitizer.sanitizeKey = function (name) {
                        if (name) {
                            // Remove any leading or trailing whitepace
                            name = ApplicationInsights.Util.trim(name.toString());
                            // truncate the string to 150 chars
                            if (name.length > DataSanitizer.MAX_NAME_LENGTH) {
                                name = name.substring(0, DataSanitizer.MAX_NAME_LENGTH);
                                ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.NameTooLong, "name is too long.  It has been truncated to " + DataSanitizer.MAX_NAME_LENGTH + " characters.", { name: name }, true);
                            }
                        }
                        return name;
                    };
                    DataSanitizer.sanitizeString = function (value) {
                        if (value) {
                            value = ApplicationInsights.Util.trim(value);
                            if (value.toString().length > DataSanitizer.MAX_STRING_LENGTH) {
                                value = value.toString().substring(0, DataSanitizer.MAX_STRING_LENGTH);
                                ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.StringValueTooLong, "string value is too long. It has been truncated to " + DataSanitizer.MAX_STRING_LENGTH + " characters.", { value: value }, true);
                            }
                        }
                        return value;
                    };
                    DataSanitizer.sanitizeUrl = function (url) {
                        if (url) {
                            url = ApplicationInsights.Util.trim(url);
                            if (url.length > DataSanitizer.MAX_URL_LENGTH) {
                                url = url.substring(0, DataSanitizer.MAX_URL_LENGTH);
                                ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.UrlTooLong, "url is too long, it has been truncated to " + DataSanitizer.MAX_URL_LENGTH + " characters.", { url: url }, true);
                            }
                        }
                        return url;
                    };
                    DataSanitizer.sanitizeMessage = function (message) {
                        if (message) {
                            if (message.length > DataSanitizer.MAX_MESSAGE_LENGTH) {
                                message = message.substring(0, DataSanitizer.MAX_MESSAGE_LENGTH);
                                ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.MessageTruncated, "message is too long, it has been truncated to " + DataSanitizer.MAX_MESSAGE_LENGTH + " characters.", { message: message }, true);
                            }
                        }
                        return message;
                    };
                    DataSanitizer.sanitizeException = function (exception) {
                        if (exception) {
                            if (exception.length > DataSanitizer.MAX_EXCEPTION_LENGTH) {
                                exception = exception.substring(0, DataSanitizer.MAX_EXCEPTION_LENGTH);
                                ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.ExceptionTruncated, "exception is too long, it has been truncated to " + DataSanitizer.MAX_EXCEPTION_LENGTH + " characters.", { exception: exception }, true);
                            }
                        }
                        return exception;
                    };
                    DataSanitizer.sanitizeProperties = function (properties) {
                        if (properties) {
                            var tempProps = {};
                            for (var prop in properties) {
                                var value = DataSanitizer.sanitizeString(properties[prop]);
                                prop = DataSanitizer.sanitizeKeyAndAddUniqueness(prop, tempProps);
                                tempProps[prop] = value;
                            }
                            properties = tempProps;
                        }
                        return properties;
                    };
                    DataSanitizer.sanitizeMeasurements = function (measurements) {
                        if (measurements) {
                            var tempMeasurements = {};
                            for (var measure in measurements) {
                                var value = measurements[measure];
                                measure = DataSanitizer.sanitizeKeyAndAddUniqueness(measure, tempMeasurements);
                                tempMeasurements[measure] = value;
                            }
                            measurements = tempMeasurements;
                        }
                        return measurements;
                    };
                    DataSanitizer.padNumber = function (num) {
                        var s = "00" + num;
                        return s.substr(s.length - 3);
                    };
                    /**
                    * Max length allowed for custom names.
                    */
                    DataSanitizer.MAX_NAME_LENGTH = 150;
                    /**
                     * Max length allowed for custom values.
                     */
                    DataSanitizer.MAX_STRING_LENGTH = 1024;
                    /**
                     * Max length allowed for url.
                     */
                    DataSanitizer.MAX_URL_LENGTH = 2048;
                    /**
                     * Max length allowed for messages.
                     */
                    DataSanitizer.MAX_MESSAGE_LENGTH = 32768;
                    /**
                     * Max length allowed for exceptions.
                     */
                    DataSanitizer.MAX_EXCEPTION_LENGTH = 32768;
                    return DataSanitizer;
                }());
                Common.DataSanitizer = DataSanitizer;
            })(Common = Telemetry.Common || (Telemetry.Common = {}));
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/MessageData.ts" />
/// <reference path="./Common/DataSanitizer.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            var Trace = (function (_super) {
                __extends(Trace, _super);
                /**
                 * Constructs a new instance of the MetricTelemetry object
                 */
                function Trace(message, properties) {
                    _super.call(this);
                    this.aiDataContract = {
                        ver: ApplicationInsights.FieldType.Required,
                        message: ApplicationInsights.FieldType.Required,
                        severityLevel: ApplicationInsights.FieldType.Default,
                        measurements: ApplicationInsights.FieldType.Default,
                        properties: ApplicationInsights.FieldType.Default
                    };
                    message = message || ApplicationInsights.Util.NotSpecified;
                    this.message = Telemetry.Common.DataSanitizer.sanitizeMessage(message);
                    this.properties = Telemetry.Common.DataSanitizer.sanitizeProperties(properties);
                }
                Trace.envelopeType = "Microsoft.ApplicationInsights.{0}.Message";
                Trace.dataType = "MessageData";
                return Trace;
            }(AI.MessageData));
            Telemetry.Trace = Trace;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="Domain.ts" />
var AI;
(function (AI) {
    "use strict";
    var EventData = (function (_super) {
        __extends(EventData, _super);
        function EventData() {
            _super.call(this);
            this.ver = 2;
            this.properties = {};
            this.measurements = {};
            _super.call(this);
        }
        return EventData;
    }(Microsoft.Telemetry.Domain));
    AI.EventData = EventData;
})(AI || (AI = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/EventData.ts" />
/// <reference path="./Common/DataSanitizer.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            var Event = (function (_super) {
                __extends(Event, _super);
                /**
                 * Constructs a new instance of the EventTelemetry object
                 */
                function Event(name, properties, measurements) {
                    _super.call(this);
                    this.aiDataContract = {
                        ver: ApplicationInsights.FieldType.Required,
                        name: ApplicationInsights.FieldType.Required,
                        properties: ApplicationInsights.FieldType.Default,
                        measurements: ApplicationInsights.FieldType.Default
                    };
                    this.name = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeString(name) || ApplicationInsights.Util.NotSpecified;
                    this.properties = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeProperties(properties);
                    this.measurements = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeMeasurements(measurements);
                }
                Event.envelopeType = "Microsoft.ApplicationInsights.{0}.Event";
                Event.dataType = "EventData";
                return Event;
            }(AI.EventData));
            Telemetry.Event = Event;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    var ExceptionDetails = (function () {
        function ExceptionDetails() {
            this.hasFullStack = true;
            this.parsedStack = [];
        }
        return ExceptionDetails;
    }());
    AI.ExceptionDetails = ExceptionDetails;
})(AI || (AI = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="Domain.ts" />
/// <reference path="SeverityLevel.ts" />
/// <reference path="ExceptionDetails.ts"/>
var AI;
(function (AI) {
    "use strict";
    var ExceptionData = (function (_super) {
        __extends(ExceptionData, _super);
        function ExceptionData() {
            _super.call(this);
            this.ver = 2;
            this.exceptions = [];
            this.properties = {};
            this.measurements = {};
            _super.call(this);
        }
        return ExceptionData;
    }(Microsoft.Telemetry.Domain));
    AI.ExceptionData = ExceptionData;
})(AI || (AI = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    var StackFrame = (function () {
        function StackFrame() {
        }
        return StackFrame;
    }());
    AI.StackFrame = StackFrame;
})(AI || (AI = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/ExceptionData.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/StackFrame.ts" />
/// <reference path="./Common/DataSanitizer.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            var Exception = (function (_super) {
                __extends(Exception, _super);
                /**
                * Constructs a new isntance of the ExceptionTelemetry object
                */
                function Exception(exception, handledAt, properties, measurements, severityLevel) {
                    _super.call(this);
                    this.aiDataContract = {
                        ver: ApplicationInsights.FieldType.Required,
                        handledAt: ApplicationInsights.FieldType.Required,
                        exceptions: ApplicationInsights.FieldType.Required,
                        severityLevel: ApplicationInsights.FieldType.Default,
                        properties: ApplicationInsights.FieldType.Default,
                        measurements: ApplicationInsights.FieldType.Default
                    };
                    this.properties = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeProperties(properties);
                    this.measurements = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeMeasurements(measurements);
                    this.handledAt = handledAt || "unhandled";
                    this.exceptions = [new _ExceptionDetails(exception)];
                    if (severityLevel) {
                        this.severityLevel = severityLevel;
                    }
                }
                /**
                * Creates a simple exception with 1 stack frame. Useful for manual constracting of exception.
                */
                Exception.CreateSimpleException = function (message, typeName, assembly, fileName, details, line, handledAt) {
                    return {
                        handledAt: handledAt || "unhandled",
                        exceptions: [
                            {
                                hasFullStack: true,
                                message: message,
                                stack: details,
                                typeName: typeName,
                                parsedStack: [
                                    {
                                        level: 0,
                                        assembly: assembly,
                                        fileName: fileName,
                                        line: line,
                                        method: "unknown"
                                    }
                                ]
                            }
                        ]
                    };
                };
                Exception.envelopeType = "Microsoft.ApplicationInsights.{0}.Exception";
                Exception.dataType = "ExceptionData";
                return Exception;
            }(AI.ExceptionData));
            Telemetry.Exception = Exception;
            var _ExceptionDetails = (function (_super) {
                __extends(_ExceptionDetails, _super);
                function _ExceptionDetails(exception) {
                    _super.call(this);
                    this.aiDataContract = {
                        id: ApplicationInsights.FieldType.Default,
                        outerId: ApplicationInsights.FieldType.Default,
                        typeName: ApplicationInsights.FieldType.Required,
                        message: ApplicationInsights.FieldType.Required,
                        hasFullStack: ApplicationInsights.FieldType.Default,
                        stack: ApplicationInsights.FieldType.Default,
                        parsedStack: ApplicationInsights.FieldType.Array
                    };
                    this.typeName = Telemetry.Common.DataSanitizer.sanitizeString(exception.name) || ApplicationInsights.Util.NotSpecified;
                    this.message = Telemetry.Common.DataSanitizer.sanitizeMessage(exception.message) || ApplicationInsights.Util.NotSpecified;
                    var stack = exception["stack"];
                    this.parsedStack = this.parseStack(stack);
                    this.stack = Telemetry.Common.DataSanitizer.sanitizeException(stack);
                    this.hasFullStack = ApplicationInsights.Util.isArray(this.parsedStack) && this.parsedStack.length > 0;
                }
                _ExceptionDetails.prototype.parseStack = function (stack) {
                    var parsedStack = undefined;
                    if (typeof stack === "string") {
                        var frames = stack.split('\n');
                        parsedStack = [];
                        var level = 0;
                        var totalSizeInBytes = 0;
                        for (var i = 0; i <= frames.length; i++) {
                            var frame = frames[i];
                            if (_StackFrame.regex.test(frame)) {
                                var parsedFrame = new _StackFrame(frames[i], level++);
                                totalSizeInBytes += parsedFrame.sizeInBytes;
                                parsedStack.push(parsedFrame);
                            }
                        }
                        // DP Constraint - exception parsed stack must be < 32KB
                        // remove frames from the middle to meet the threshold
                        var exceptionParsedStackThreshold = 32 * 1024;
                        if (totalSizeInBytes > exceptionParsedStackThreshold) {
                            var left = 0;
                            var right = parsedStack.length - 1;
                            var size = 0;
                            var acceptedLeft = left;
                            var acceptedRight = right;
                            while (left < right) {
                                // check size
                                var lSize = parsedStack[left].sizeInBytes;
                                var rSize = parsedStack[right].sizeInBytes;
                                size += lSize + rSize;
                                if (size > exceptionParsedStackThreshold) {
                                    // remove extra frames from the middle
                                    var howMany = acceptedRight - acceptedLeft + 1;
                                    parsedStack.splice(acceptedLeft, howMany);
                                    break;
                                }
                                // update pointers
                                acceptedLeft = left;
                                acceptedRight = right;
                                left++;
                                right--;
                            }
                        }
                    }
                    return parsedStack;
                };
                return _ExceptionDetails;
            }(AI.ExceptionDetails));
            var _StackFrame = (function (_super) {
                __extends(_StackFrame, _super);
                function _StackFrame(frame, level) {
                    _super.call(this);
                    this.sizeInBytes = 0;
                    this.aiDataContract = {
                        level: ApplicationInsights.FieldType.Required,
                        method: ApplicationInsights.FieldType.Required,
                        assembly: ApplicationInsights.FieldType.Default,
                        fileName: ApplicationInsights.FieldType.Default,
                        line: ApplicationInsights.FieldType.Default
                    };
                    this.level = level;
                    this.method = "<no_method>";
                    this.assembly = ApplicationInsights.Util.trim(frame);
                    var matches = frame.match(_StackFrame.regex);
                    if (matches && matches.length >= 5) {
                        this.method = ApplicationInsights.Util.trim(matches[2]) || this.method;
                        this.fileName = ApplicationInsights.Util.trim(matches[4]);
                        this.line = parseInt(matches[5]) || 0;
                    }
                    this.sizeInBytes += this.method.length;
                    this.sizeInBytes += this.fileName.length;
                    this.sizeInBytes += this.assembly.length;
                    // todo: these might need to be removed depending on how the back-end settles on their size calculation
                    this.sizeInBytes += _StackFrame.baseSize;
                    this.sizeInBytes += this.level.toString().length;
                    this.sizeInBytes += this.line.toString().length;
                }
                // regex to match stack frames from ie/chrome/ff
                // methodName=$2, fileName=$4, lineNo=$5, column=$6
                _StackFrame.regex = /^([\s]+at)?(.*?)(\@|\s\(|\s)([^\(\@\n]+):([0-9]+):([0-9]+)(\)?)$/;
                _StackFrame.baseSize = 58; //'{"method":"","level":,"assembly":"","fileName":"","line":}'.length
                return _StackFrame;
            }(AI.StackFrame));
            Telemetry._StackFrame = _StackFrame;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="Domain.ts" />
var AI;
(function (AI) {
    "use strict";
    var MetricData = (function (_super) {
        __extends(MetricData, _super);
        function MetricData() {
            _super.call(this);
            this.ver = 2;
            this.metrics = [];
            this.properties = {};
            _super.call(this);
        }
        return MetricData;
    }(Microsoft.Telemetry.Domain));
    AI.MetricData = MetricData;
})(AI || (AI = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    (function (DataPointType) {
        DataPointType[DataPointType["Measurement"] = 0] = "Measurement";
        DataPointType[DataPointType["Aggregation"] = 1] = "Aggregation";
    })(AI.DataPointType || (AI.DataPointType = {}));
    var DataPointType = AI.DataPointType;
})(AI || (AI = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="DataPointType.ts" />
var AI;
(function (AI) {
    "use strict";
    var DataPoint = (function () {
        function DataPoint() {
            this.kind = AI.DataPointType.Measurement;
        }
        return DataPoint;
    }());
    AI.DataPoint = DataPoint;
})(AI || (AI = {}));
/// <reference path="../../../JavaScriptSDK.Interfaces/Contracts/Generated/DataPoint.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            var Common;
            (function (Common) {
                "use strict";
                var DataPoint = (function (_super) {
                    __extends(DataPoint, _super);
                    function DataPoint() {
                        _super.apply(this, arguments);
                        /**
                         * The data contract for serializing this object.
                         */
                        this.aiDataContract = {
                            name: ApplicationInsights.FieldType.Required,
                            kind: ApplicationInsights.FieldType.Default,
                            value: ApplicationInsights.FieldType.Required,
                            count: ApplicationInsights.FieldType.Default,
                            min: ApplicationInsights.FieldType.Default,
                            max: ApplicationInsights.FieldType.Default,
                            stdDev: ApplicationInsights.FieldType.Default
                        };
                    }
                    return DataPoint;
                }(AI.DataPoint));
                Common.DataPoint = DataPoint;
            })(Common = Telemetry.Common || (Telemetry.Common = {}));
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/MetricData.ts" />
/// <reference path="./Common/DataSanitizer.ts" />
/// <reference path="./Common/DataPoint.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            var Metric = (function (_super) {
                __extends(Metric, _super);
                /**
                 * Constructs a new instance of the MetricTelemetry object
                 */
                function Metric(name, value, count, min, max, properties) {
                    _super.call(this);
                    this.aiDataContract = {
                        ver: ApplicationInsights.FieldType.Required,
                        metrics: ApplicationInsights.FieldType.Required,
                        properties: ApplicationInsights.FieldType.Default
                    };
                    var dataPoint = new Microsoft.ApplicationInsights.Telemetry.Common.DataPoint();
                    dataPoint.count = count > 0 ? count : undefined;
                    dataPoint.max = isNaN(max) || max === null ? undefined : max;
                    dataPoint.min = isNaN(min) || min === null ? undefined : min;
                    dataPoint.name = Telemetry.Common.DataSanitizer.sanitizeString(name) || ApplicationInsights.Util.NotSpecified;
                    dataPoint.value = value;
                    this.metrics = [dataPoint];
                    this.properties = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeProperties(properties);
                }
                Metric.envelopeType = "Microsoft.ApplicationInsights.{0}.Metric";
                Metric.dataType = "MetricData";
                return Metric;
            }(AI.MetricData));
            Telemetry.Metric = Metric;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="EventData.ts" />
var AI;
(function (AI) {
    "use strict";
    var PageViewData = (function (_super) {
        __extends(PageViewData, _super);
        function PageViewData() {
            _super.call(this);
            this.ver = 2;
            this.properties = {};
            this.measurements = {};
            _super.call(this);
        }
        return PageViewData;
    }(AI.EventData));
    AI.PageViewData = PageViewData;
})(AI || (AI = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/PageViewData.ts" />
/// <reference path="./Common/DataSanitizer.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            var PageView = (function (_super) {
                __extends(PageView, _super);
                /**
                 * Constructs a new instance of the PageEventTelemetry object
                 */
                function PageView(name, url, durationMs, properties, measurements) {
                    _super.call(this);
                    this.aiDataContract = {
                        ver: ApplicationInsights.FieldType.Required,
                        name: ApplicationInsights.FieldType.Default,
                        url: ApplicationInsights.FieldType.Default,
                        duration: ApplicationInsights.FieldType.Default,
                        properties: ApplicationInsights.FieldType.Default,
                        measurements: ApplicationInsights.FieldType.Default
                    };
                    this.url = Telemetry.Common.DataSanitizer.sanitizeUrl(url);
                    this.name = Telemetry.Common.DataSanitizer.sanitizeString(name) || ApplicationInsights.Util.NotSpecified;
                    if (!isNaN(durationMs)) {
                        this.duration = ApplicationInsights.Util.msToTimeSpan(durationMs);
                    }
                    this.properties = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeProperties(properties);
                    this.measurements = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeMeasurements(measurements);
                }
                PageView.envelopeType = "Microsoft.ApplicationInsights.{0}.Pageview";
                PageView.dataType = "PageviewData";
                return PageView;
            }(AI.PageViewData));
            Telemetry.PageView = PageView;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="PageViewData.ts" />
var AI;
(function (AI) {
    "use strict";
    var PageViewPerfData = (function (_super) {
        __extends(PageViewPerfData, _super);
        function PageViewPerfData() {
            _super.call(this);
            this.ver = 2;
            this.properties = {};
            this.measurements = {};
            _super.call(this);
        }
        return PageViewPerfData;
    }(AI.PageViewData));
    AI.PageViewPerfData = PageViewPerfData;
})(AI || (AI = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/PageViewPerfData.ts"/>
/// <reference path="./Common/DataSanitizer.ts"/>
/// <reference path="../Util.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            var PageViewPerformance = (function (_super) {
                __extends(PageViewPerformance, _super);
                /**
                 * Constructs a new instance of the PageEventTelemetry object
                 */
                function PageViewPerformance(name, url, unused, properties, measurements) {
                    _super.call(this);
                    this.aiDataContract = {
                        ver: ApplicationInsights.FieldType.Required,
                        name: ApplicationInsights.FieldType.Default,
                        url: ApplicationInsights.FieldType.Default,
                        duration: ApplicationInsights.FieldType.Default,
                        perfTotal: ApplicationInsights.FieldType.Default,
                        networkConnect: ApplicationInsights.FieldType.Default,
                        sentRequest: ApplicationInsights.FieldType.Default,
                        receivedResponse: ApplicationInsights.FieldType.Default,
                        domProcessing: ApplicationInsights.FieldType.Default,
                        properties: ApplicationInsights.FieldType.Default,
                        measurements: ApplicationInsights.FieldType.Default
                    };
                    this.isValid = false;
                    /*
                     * http://www.w3.org/TR/navigation-timing/#processing-model
                     *  |-navigationStart
                     *  |             |-connectEnd
                     *  |             ||-requestStart
                     *  |             ||             |-responseStart
                     *  |             ||             |              |-responseEnd
                     *  |             ||             |              |
                     *  |             ||             |              |         |-loadEventEnd
                     *  |---network---||---request---|---response---|---dom---|
                     *  |--------------------------total----------------------|
                     */
                    var timing = PageViewPerformance.getPerformanceTiming();
                    if (timing) {
                        var total = PageViewPerformance.getDuration(timing.navigationStart, timing.loadEventEnd);
                        var network = PageViewPerformance.getDuration(timing.navigationStart, timing.connectEnd);
                        var request = PageViewPerformance.getDuration(timing.requestStart, timing.responseStart);
                        var response = PageViewPerformance.getDuration(timing.responseStart, timing.responseEnd);
                        var dom = PageViewPerformance.getDuration(timing.responseEnd, timing.loadEventEnd);
                        if (total == 0) {
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.ErrorPVCalc, "error calculating page view performance.", { total: total, network: network, request: request, response: response, dom: dom });
                        }
                        else if (!PageViewPerformance.shouldCollectDuration(total, network, request, response, dom)) {
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.InvalidDurationValue, "Invalid page load duration value. Browser perf data won't be sent.", { total: total, network: network, request: request, response: response, dom: dom });
                        }
                        else if (total < Math.floor(network) + Math.floor(request) + Math.floor(response) + Math.floor(dom)) {
                            // some browsers may report individual components incorrectly so that the sum of the parts will be bigger than total PLT
                            // in this case, don't report client performance from this page
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.ClientPerformanceMathError, "client performance math error.", { total: total, network: network, request: request, response: response, dom: dom });
                        }
                        else {
                            this.durationMs = total;
                            // convert to timespans
                            this.perfTotal = this.duration = ApplicationInsights.Util.msToTimeSpan(total);
                            this.networkConnect = ApplicationInsights.Util.msToTimeSpan(network);
                            this.sentRequest = ApplicationInsights.Util.msToTimeSpan(request);
                            this.receivedResponse = ApplicationInsights.Util.msToTimeSpan(response);
                            this.domProcessing = ApplicationInsights.Util.msToTimeSpan(dom);
                            this.isValid = true;
                        }
                    }
                    this.url = Telemetry.Common.DataSanitizer.sanitizeUrl(url);
                    this.name = Telemetry.Common.DataSanitizer.sanitizeString(name) || ApplicationInsights.Util.NotSpecified;
                    this.properties = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeProperties(properties);
                    this.measurements = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeMeasurements(measurements);
                }
                /**
                 * Indicates whether this instance of PageViewPerformance is valid and should be sent
                 */
                PageViewPerformance.prototype.getIsValid = function () {
                    return this.isValid;
                };
                /**
                * Gets the total duration (PLT) in milliseconds. Check getIsValid() before using this method.
                */
                PageViewPerformance.prototype.getDurationMs = function () {
                    return this.durationMs;
                };
                PageViewPerformance.getPerformanceTiming = function () {
                    if (PageViewPerformance.isPerformanceTimingSupported()) {
                        return window.performance.timing;
                    }
                    return null;
                };
                /**
                * Returns true is window performance timing API is supported, false otherwise.
                */
                PageViewPerformance.isPerformanceTimingSupported = function () {
                    return typeof window != "undefined" && window.performance && window.performance.timing;
                };
                /**
                 * As page loads different parts of performance timing numbers get set. When all of them are set we can report it.
                 * Returns true if ready, false otherwise.
                 */
                PageViewPerformance.isPerformanceTimingDataReady = function () {
                    var timing = window.performance.timing;
                    return timing.domainLookupStart > 0
                        && timing.navigationStart > 0
                        && timing.responseStart > 0
                        && timing.requestStart > 0
                        && timing.loadEventEnd > 0
                        && timing.responseEnd > 0
                        && timing.connectEnd > 0
                        && timing.domLoading > 0;
                };
                PageViewPerformance.getDuration = function (start, end) {
                    var duration = undefined;
                    if (!(isNaN(start) || isNaN(end))) {
                        duration = Math.max(end - start, 0);
                    }
                    return duration;
                };
                /**
                 * This method tells if given durations should be excluded from collection.
                 */
                PageViewPerformance.shouldCollectDuration = function () {
                    var durations = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        durations[_i - 0] = arguments[_i];
                    }
                    var userAgent = navigator.userAgent;
                    var isGoogleBot = userAgent ? userAgent.toLowerCase().indexOf("googlebot") !== -1 : false;
                    if (isGoogleBot) {
                        // Don't report durations for GoogleBot, it is returning invalid values in performance.timing API. 
                        return false;
                    }
                    else {
                        // for other page views, don't report if it's outside of a reasonable range
                        for (var i = 0; i < durations.length; i++) {
                            if (durations[i] >= PageViewPerformance.MAX_DURATION_ALLOWED) {
                                return false;
                            }
                        }
                    }
                    return true;
                };
                PageViewPerformance.envelopeType = "Microsoft.ApplicationInsights.{0}.PageviewPerformance";
                PageViewPerformance.dataType = "PageviewPerformanceData";
                PageViewPerformance.MAX_DURATION_ALLOWED = 3600000; // 1h
                return PageViewPerformance;
            }(AI.PageViewPerfData));
            Telemetry.PageViewPerformance = PageViewPerformance;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="./ISerializable.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="./Contracts/Generated/Envelope.ts" />
/// <reference path="./Context/IApplication.ts"/>
/// <reference path="./Context/IDevice.ts"/>
/// <reference path="./Context/IInternal.ts"/>
/// <reference path="./Context/ILocation.ts"/>
/// <reference path="./Context/IOperation.ts"/>
/// <reference path="./Context/ISample.ts"/>
/// <reference path="./Context/IUser.ts"/>
/// <reference path="./Context/ISession.ts"/>
/// <reference path="./Telemetry/IEnvelope.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="sender.ts"/>
/// <reference path="telemetry/trace.ts" />
/// <reference path="telemetry/event.ts" />
/// <reference path="telemetry/exception.ts" />
/// <reference path="telemetry/metric.ts" />
/// <reference path="telemetry/pageview.ts" />
/// <reference path="telemetry/pageviewperformance.ts" />
/// <reference path="./Util.ts"/>
/// <reference path="../JavaScriptSDK.Interfaces/Contracts/Generated/SessionState.ts"/>
/// <reference path="../JavaScriptSDK.Interfaces/ITelemetryContext.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        var TelemetryContext = (function () {
            function TelemetryContext(config) {
                this._config = config;
                this._sender = new ApplicationInsights.Sender(config);
                // window will be undefined in node.js where we do not want to initialize contexts
                if (typeof window !== 'undefined') {
                    this._sessionManager = new ApplicationInsights.Context._SessionManager(config);
                    this.application = new ApplicationInsights.Context.Application();
                    this.device = new ApplicationInsights.Context.Device();
                    this.internal = new ApplicationInsights.Context.Internal();
                    this.location = new ApplicationInsights.Context.Location();
                    this.user = new ApplicationInsights.Context.User(config);
                    this.operation = new ApplicationInsights.Context.Operation();
                    this.session = new ApplicationInsights.Context.Session();
                    this.sample = new ApplicationInsights.Context.Sample(config.sampleRate());
                }
            }
            /**
            * Adds telemetry initializer to the collection. Telemetry initializers will be called one by one
            * before telemetry item is pushed for sending and in the order they were added.
            */
            TelemetryContext.prototype.addTelemetryInitializer = function (telemetryInitializer) {
                this.telemetryInitializers = this.telemetryInitializers || [];
                this.telemetryInitializers.push(telemetryInitializer);
            };
            /**
             * Use Sender.ts to send telemetry object to the endpoint
             */
            TelemetryContext.prototype.track = function (envelope) {
                if (!envelope) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TrackArgumentsNotSpecified, "cannot call .track() with a null or undefined argument", null, true);
                }
                else {
                    // If the envelope is PageView, reset the internal message count so that we can send internal telemetry for the new page.
                    if (envelope.name === ApplicationInsights.Telemetry.PageView.envelopeType) {
                        ApplicationInsights._InternalLogging.resetInternalMessageCount();
                    }
                    if (this.session) {
                        // If customer did not provide custom session id update sessionmanager
                        if (typeof this.session.id !== "string") {
                            this._sessionManager.update();
                        }
                    }
                    this._track(envelope);
                }
                return envelope;
            };
            TelemetryContext.prototype._track = function (envelope) {
                if (this.session) {
                    // If customer set id, apply his context; otherwise apply context generated from cookies 
                    if (typeof this.session.id === "string") {
                        this._applySessionContext(envelope, this.session);
                    }
                    else {
                        this._applySessionContext(envelope, this._sessionManager.automaticSession);
                    }
                }
                this._applyApplicationContext(envelope, this.application);
                this._applyDeviceContext(envelope, this.device);
                this._applyInternalContext(envelope, this.internal);
                this._applyLocationContext(envelope, this.location);
                this._applySampleContext(envelope, this.sample);
                this._applyUserContext(envelope, this.user);
                this._applyOperationContext(envelope, this.operation);
                envelope.iKey = this._config.instrumentationKey();
                var doNotSendItem = false;
                try {
                    this.telemetryInitializers = this.telemetryInitializers || [];
                    var telemetryInitializersCount = this.telemetryInitializers.length;
                    for (var i = 0; i < telemetryInitializersCount; ++i) {
                        var telemetryInitializer = this.telemetryInitializers[i];
                        if (telemetryInitializer) {
                            if (telemetryInitializer.apply(null, [envelope]) === false) {
                                doNotSendItem = true;
                                break;
                            }
                        }
                    }
                }
                catch (e) {
                    doNotSendItem = true;
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TelemetryInitializerFailed, "One of telemetry initializers failed, telemetry item will not be sent: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) }, true);
                }
                if (!doNotSendItem) {
                    this._fixDepricatedValues(envelope);
                    if (envelope.name === ApplicationInsights.Telemetry.Metric.envelopeType ||
                        this.sample.isSampledIn(envelope)) {
                        var iKeyNoDashes = this._config.instrumentationKey().replace(/-/g, "");
                        envelope.name = envelope.name.replace("{0}", iKeyNoDashes);
                        this._sender.send(envelope);
                    }
                    else {
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.TelemetrySampledAndNotSent, "Telemetry is sampled and not sent to the AI service.", { SampleRate: this.sample.sampleRate }, true);
                    }
                }
                return envelope;
            };
            TelemetryContext.prototype._applyApplicationContext = function (envelope, appContext) {
                if (appContext) {
                    var tagKeys = new AI.ContextTagKeys();
                    if (typeof appContext.ver === "string") {
                        envelope.tags[tagKeys.applicationVersion] = appContext.ver;
                    }
                    if (typeof appContext.build === "string") {
                        envelope.tags[tagKeys.applicationBuild] = appContext.build;
                    }
                }
            };
            TelemetryContext.prototype._applyDeviceContext = function (envelope, deviceContext) {
                var tagKeys = new AI.ContextTagKeys();
                if (deviceContext) {
                    if (typeof deviceContext.id === "string") {
                        envelope.tags[tagKeys.deviceId] = deviceContext.id;
                    }
                    if (typeof deviceContext.ip === "string") {
                        envelope.tags[tagKeys.deviceIp] = deviceContext.ip;
                    }
                    if (typeof deviceContext.language === "string") {
                        envelope.tags[tagKeys.deviceLanguage] = deviceContext.language;
                    }
                    if (typeof deviceContext.locale === "string") {
                        envelope.tags[tagKeys.deviceLocale] = deviceContext.locale;
                    }
                    if (typeof deviceContext.model === "string") {
                        envelope.tags[tagKeys.deviceModel] = deviceContext.model;
                    }
                    if (typeof deviceContext.network !== "undefined") {
                        envelope.tags[tagKeys.deviceNetwork] = deviceContext.network;
                    }
                    if (typeof deviceContext.oemName === "string") {
                        envelope.tags[tagKeys.deviceOEMName] = deviceContext.oemName;
                    }
                    if (typeof deviceContext.os === "string") {
                        envelope.tags[tagKeys.deviceOS] = deviceContext.os;
                    }
                    if (typeof deviceContext.osversion === "string") {
                        envelope.tags[tagKeys.deviceOSVersion] = deviceContext.osversion;
                    }
                    if (typeof deviceContext.resolution === "string") {
                        envelope.tags[tagKeys.deviceScreenResolution] = deviceContext.resolution;
                    }
                    if (typeof deviceContext.type === "string") {
                        envelope.tags[tagKeys.deviceType] = deviceContext.type;
                    }
                }
            };
            TelemetryContext.prototype._applyInternalContext = function (envelope, internalContext) {
                if (internalContext) {
                    var tagKeys = new AI.ContextTagKeys();
                    if (typeof internalContext.agentVersion === "string") {
                        envelope.tags[tagKeys.internalAgentVersion] = internalContext.agentVersion;
                    }
                    if (typeof internalContext.sdkVersion === "string") {
                        envelope.tags[tagKeys.internalSdkVersion] = internalContext.sdkVersion;
                    }
                }
            };
            TelemetryContext.prototype._applyLocationContext = function (envelope, locationContext) {
                if (locationContext) {
                    var tagKeys = new AI.ContextTagKeys();
                    if (typeof locationContext.ip === "string") {
                        envelope.tags[tagKeys.locationIp] = locationContext.ip;
                    }
                }
            };
            TelemetryContext.prototype._applyOperationContext = function (envelope, operationContext) {
                if (operationContext) {
                    var tagKeys = new AI.ContextTagKeys();
                    if (typeof operationContext.id === "string") {
                        envelope.tags[tagKeys.operationId] = operationContext.id;
                    }
                    if (typeof operationContext.name === "string") {
                        envelope.tags[tagKeys.operationName] = operationContext.name;
                    }
                    if (typeof operationContext.parentId === "string") {
                        envelope.tags[tagKeys.operationParentId] = operationContext.parentId;
                    }
                    if (typeof operationContext.rootId === "string") {
                        envelope.tags[tagKeys.operationRootId] = operationContext.rootId;
                    }
                    if (typeof operationContext.syntheticSource === "string") {
                        envelope.tags[tagKeys.operationSyntheticSource] = operationContext.syntheticSource;
                    }
                }
            };
            TelemetryContext.prototype._applySampleContext = function (envelope, sampleContext) {
                if (sampleContext) {
                    envelope.sampleRate = sampleContext.sampleRate;
                }
            };
            TelemetryContext.prototype._applySessionContext = function (envelope, sessionContext) {
                if (sessionContext) {
                    var tagKeys = new AI.ContextTagKeys();
                    if (typeof sessionContext.id === "string") {
                        envelope.tags[tagKeys.sessionId] = sessionContext.id;
                    }
                    if (typeof sessionContext.isFirst !== "undefined") {
                        envelope.tags[tagKeys.sessionIsFirst] = sessionContext.isFirst;
                    }
                }
            };
            TelemetryContext.prototype._applyUserContext = function (envelope, userContext) {
                if (userContext) {
                    var tagKeys = new AI.ContextTagKeys();
                    if (typeof userContext.accountId === "string") {
                        envelope.tags[tagKeys.userAccountId] = userContext.accountId;
                    }
                    if (typeof userContext.agent === "string") {
                        envelope.tags[tagKeys.userAgent] = userContext.agent;
                    }
                    if (typeof userContext.id === "string") {
                        envelope.tags[tagKeys.userId] = userContext.id;
                    }
                    if (typeof userContext.authenticatedId === "string") {
                        envelope.tags[tagKeys.userAuthUserId] = userContext.authenticatedId;
                    }
                    if (typeof userContext.storeRegion === "string") {
                        envelope.tags[tagKeys.userStoreRegion] = userContext.storeRegion;
                    }
                }
            };
            TelemetryContext.prototype._fixDepricatedValues = function (envelope) {
                try {
                    var data = envelope.data;
                    if (data && data.baseType === Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData.dataType) {
                        var rddData = data.baseData;
                        if (rddData) {
                            this._fixRDDDepricatedValues(rddData);
                        }
                    }
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.FailedToFixDepricatedValues, "Failed to parse the base data object, to fix the depricated values " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            TelemetryContext.prototype._fixRDDDepricatedValues = function (rddData) {
                if (rddData.commandName) {
                    rddData.data = rddData.commandName;
                    rddData.commandName = undefined;
                }
                if (rddData.dependencyTypeName) {
                    rddData.type = rddData.dependencyTypeName;
                    rddData.dependencyTypeName = undefined;
                }
                if (rddData.value && rddData.value !== 0) {
                    rddData.duration = ApplicationInsights.Util.msToTimeSpan(rddData.value);
                    rddData.value = undefined;
                }
                if (rddData.kind) {
                    rddData.kind = undefined;
                }
                if (rddData.dependencySource) {
                    rddData.dependencySource = undefined;
                }
                if (rddData.async) {
                    rddData.async = undefined;
                }
                if (rddData.count) {
                    rddData.count = undefined;
                }
                if (rddData.min) {
                    rddData.min = undefined;
                }
                if (rddData.max) {
                    rddData.max = undefined;
                }
                if (rddData.stdDev) {
                    rddData.stdDev = undefined;
                }
                if (rddData.dependencyKind) {
                    rddData.dependencyKind = undefined;
                }
            };
            return TelemetryContext;
        }());
        ApplicationInsights.TelemetryContext = TelemetryContext;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="Base.ts" />
var Microsoft;
(function (Microsoft) {
    var Telemetry;
    (function (Telemetry) {
        "use strict";
        var Data = (function (_super) {
            __extends(Data, _super);
            function Data() {
                _super.call(this);
            }
            return Data;
        }(Microsoft.Telemetry.Base));
        Telemetry.Data = Data;
    })(Telemetry = Microsoft.Telemetry || (Microsoft.Telemetry = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../../JavaScriptSDK.Interfaces/Contracts/Generated/Data.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            var Common;
            (function (Common) {
                "use strict";
                var Data = (function (_super) {
                    __extends(Data, _super);
                    /**
                     * Constructs a new instance of telemetry data.
                     */
                    function Data(type, data) {
                        _super.call(this);
                        /**
                         * The data contract for serializing this object.
                         */
                        this.aiDataContract = {
                            baseType: ApplicationInsights.FieldType.Required,
                            baseData: ApplicationInsights.FieldType.Required
                        };
                        this.baseType = type;
                        this.baseData = data;
                    }
                    return Data;
                }(Microsoft.Telemetry.Data));
                Common.Data = Data;
            })(Common = Telemetry.Common || (Telemetry.Common = {}));
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/PageViewData.ts" />
/// <reference path="./Common/DataSanitizer.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            /**
            * Class encapsulates sending page views and page view performance telemetry.
            */
            var PageViewManager = (function () {
                function PageViewManager(appInsights, overridePageViewDuration) {
                    this.pageViewPerformanceSent = false;
                    this.overridePageViewDuration = false;
                    this.overridePageViewDuration = overridePageViewDuration;
                    this.appInsights = appInsights;
                }
                /**
                * Currently supported cases:
                * 1) (default case) track page view called with default parameters, overridePageViewDuration = false. Page view is sent with page view performance when navigation timing data is available.
                *    If navigation timing is not supported then page view is sent right away with undefined duration. Page view performance is not sent.
                * 2) overridePageViewDuration = true, custom duration provided. Custom duration is used, page view sends right away.
                * 3) overridePageViewDuration = true. Page view is sent right away, duration is time spent from page load till now (or undefined if navigation timing is not supported).
                * 4) overridePageViewDuration = false, custom duration is provided. Page view is sent right away with custom duration.
                *
                * In all cases page view performance is sent once (only for the 1st call of trackPageView), or not sent if navigation timing is not supported.
                */
                PageViewManager.prototype.trackPageView = function (name, url, properties, measurements, duration) {
                    var _this = this;
                    // ensure we have valid values for the required fields
                    if (typeof name !== "string") {
                        name = window.document && window.document.title || "";
                    }
                    if (typeof url !== "string") {
                        url = window.location && window.location.href || "";
                    }
                    var pageViewSent = false;
                    var customDuration = undefined;
                    if (Telemetry.PageViewPerformance.isPerformanceTimingSupported()) {
                        var start = Telemetry.PageViewPerformance.getPerformanceTiming().navigationStart;
                        customDuration = Telemetry.PageViewPerformance.getDuration(start, +new Date);
                        if (!Telemetry.PageViewPerformance.shouldCollectDuration(customDuration)) {
                            customDuration = undefined;
                        }
                    }
                    else {
                        this.appInsights.sendPageViewInternal(name, url, !isNaN(duration) ? duration : undefined, properties, measurements);
                        this.appInsights.flush();
                        pageViewSent = true;
                    }
                    if (!pageViewSent && (this.overridePageViewDuration || !isNaN(duration))) {
                        // 1, 2, 4 cases
                        this.appInsights.sendPageViewInternal(name, url, !isNaN(duration) ? duration : customDuration, properties, measurements);
                        this.appInsights.flush();
                        pageViewSent = true;
                    }
                    var maxDurationLimit = 60000;
                    if (!Telemetry.PageViewPerformance.isPerformanceTimingSupported()) {
                        // no navigation timing (IE 8, iOS Safari 8.4, Opera Mini 8 - see http://caniuse.com/#feat=nav-timing)
                        ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.NavigationTimingNotSupported, "trackPageView: navigation timing API used for calculation of page duration is not supported in this browser. This page view will be collected without duration and timing info.");
                        return;
                    }
                    var handle = setInterval(function () {
                        try {
                            if (Telemetry.PageViewPerformance.isPerformanceTimingDataReady()) {
                                clearInterval(handle);
                                var pageViewPerformance = new Telemetry.PageViewPerformance(name, url, null, properties, measurements);
                                if (!pageViewPerformance.getIsValid() && !pageViewSent) {
                                    // If navigation timing gives invalid numbers, then go back to "override page view duration" mode.
                                    // That's the best value we can get that makes sense.
                                    _this.appInsights.sendPageViewInternal(name, url, customDuration, properties, measurements);
                                    _this.appInsights.flush();
                                }
                                else {
                                    if (!pageViewSent) {
                                        _this.appInsights.sendPageViewInternal(name, url, pageViewPerformance.getDurationMs(), properties, measurements);
                                    }
                                    if (!_this.pageViewPerformanceSent) {
                                        _this.appInsights.sendPageViewPerformanceInternal(pageViewPerformance);
                                        _this.pageViewPerformanceSent = true;
                                    }
                                    _this.appInsights.flush();
                                }
                            }
                            else if (Telemetry.PageViewPerformance.getDuration(start, +new Date) > maxDurationLimit) {
                                clearInterval(handle);
                                if (!pageViewSent) {
                                    _this.appInsights.sendPageViewInternal(name, url, maxDurationLimit, properties, measurements);
                                    _this.appInsights.flush();
                                }
                            }
                        }
                        catch (e) {
                            ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TrackPVFailedCalc, "trackPageView failed on page load calculation: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                        }
                    }, 100);
                };
                return PageViewManager;
            }());
            Telemetry.PageViewManager = PageViewManager;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="../AppInsights.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            /**
             * Used to track page visit durations
             */
            var PageVisitTimeManager = (function () {
                /**
                 * Creates a new instance of PageVisitTimeManager
                 * @param pageVisitTimeTrackingHandler Delegate that will be called to send telemetry data to AI (when trackPreviousPageVisit is called)
                 * @returns {}
                 */
                function PageVisitTimeManager(pageVisitTimeTrackingHandler) {
                    this.prevPageVisitDataKeyName = "prevPageVisitData";
                    this.pageVisitTimeTrackingHandler = pageVisitTimeTrackingHandler;
                }
                /**
                * Tracks the previous page visit time telemetry (if exists) and starts timing of new page visit time
                * @param currentPageName Name of page to begin timing for visit duration
                * @param currentPageUrl Url of page to begin timing for visit duration
                */
                PageVisitTimeManager.prototype.trackPreviousPageVisit = function (currentPageName, currentPageUrl) {
                    try {
                        // Restart timer for new page view
                        var prevPageVisitTimeData = this.restartPageVisitTimer(currentPageName, currentPageUrl);
                        // If there was a page already being timed, track the visit time for it now.
                        if (prevPageVisitTimeData) {
                            this.pageVisitTimeTrackingHandler(prevPageVisitTimeData.pageName, prevPageVisitTimeData.pageUrl, prevPageVisitTimeData.pageVisitTime);
                        }
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.warnToConsole("Auto track page visit time failed, metric will not be collected: " + ApplicationInsights.Util.dump(e));
                    }
                };
                /**
                 * Stops timing of current page (if exists) and starts timing for duration of visit to pageName
                 * @param pageName Name of page to begin timing visit duration
                 * @returns {PageVisitData} Page visit data (including duration) of pageName from last call to start or restart, if exists. Null if not.
                 */
                PageVisitTimeManager.prototype.restartPageVisitTimer = function (pageName, pageUrl) {
                    try {
                        var prevPageVisitData = this.stopPageVisitTimer();
                        this.startPageVisitTimer(pageName, pageUrl);
                        return prevPageVisitData;
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.warnToConsole("Call to restart failed: " + ApplicationInsights.Util.dump(e));
                        return null;
                    }
                };
                /**
                 * Starts timing visit duration of pageName
                 * @param pageName
                 * @returns {}
                 */
                PageVisitTimeManager.prototype.startPageVisitTimer = function (pageName, pageUrl) {
                    try {
                        if (ApplicationInsights.Util.canUseSessionStorage()) {
                            if (ApplicationInsights.Util.getSessionStorage(this.prevPageVisitDataKeyName) != null) {
                                throw new Error("Cannot call startPageVisit consecutively without first calling stopPageVisit");
                            }
                            var currPageVisitData = new PageVisitData(pageName, pageUrl);
                            var currPageVisitDataStr = JSON.stringify(currPageVisitData);
                            ApplicationInsights.Util.setSessionStorage(this.prevPageVisitDataKeyName, currPageVisitDataStr);
                        }
                    }
                    catch (e) {
                        //TODO: Remove this catch in next phase, since if start is called twice in a row the exception needs to be propagated out
                        ApplicationInsights._InternalLogging.warnToConsole("Call to start failed: " + ApplicationInsights.Util.dump(e));
                    }
                };
                /**
                 * Stops timing of current page, if exists.
                 * @returns {PageVisitData} Page visit data (including duration) of pageName from call to start, if exists. Null if not.
                 */
                PageVisitTimeManager.prototype.stopPageVisitTimer = function () {
                    try {
                        if (ApplicationInsights.Util.canUseSessionStorage()) {
                            // Define end time of page's visit
                            var pageVisitEndTime = Date.now();
                            // Try to retrieve  page name and start time from session storage
                            var pageVisitDataJsonStr = ApplicationInsights.Util.getSessionStorage(this.prevPageVisitDataKeyName);
                            if (pageVisitDataJsonStr) {
                                // if previous page data exists, set end time of visit
                                var prevPageVisitData = JSON.parse(pageVisitDataJsonStr);
                                prevPageVisitData.pageVisitTime = pageVisitEndTime - prevPageVisitData.pageVisitStartTime;
                                // Remove data from storage since we already used it
                                ApplicationInsights.Util.removeSessionStorage(this.prevPageVisitDataKeyName);
                                // Return page visit data
                                return prevPageVisitData;
                            }
                            else {
                                return null;
                            }
                        }
                        return null;
                    }
                    catch (e) {
                        ApplicationInsights._InternalLogging.warnToConsole("Stop page visit timer failed: " + ApplicationInsights.Util.dump(e));
                        return null;
                    }
                };
                return PageVisitTimeManager;
            }());
            Telemetry.PageVisitTimeManager = PageVisitTimeManager;
            var PageVisitData = (function () {
                function PageVisitData(pageName, pageUrl) {
                    this.pageVisitStartTime = Date.now();
                    this.pageName = pageName;
                    this.pageUrl = pageUrl;
                }
                return PageVisitData;
            }());
            Telemetry.PageVisitData = PageVisitData;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    (function (DependencyKind) {
        DependencyKind[DependencyKind["SQL"] = 0] = "SQL";
        DependencyKind[DependencyKind["Http"] = 1] = "Http";
        DependencyKind[DependencyKind["Other"] = 2] = "Other";
    })(AI.DependencyKind || (AI.DependencyKind = {}));
    var DependencyKind = AI.DependencyKind;
})(AI || (AI = {}));
// THIS TYPE WAS AUTOGENERATED
var AI;
(function (AI) {
    "use strict";
    (function (DependencySourceType) {
        DependencySourceType[DependencySourceType["Undefined"] = 0] = "Undefined";
        DependencySourceType[DependencySourceType["Aic"] = 1] = "Aic";
        DependencySourceType[DependencySourceType["Apmc"] = 2] = "Apmc";
    })(AI.DependencySourceType || (AI.DependencySourceType = {}));
    var DependencySourceType = AI.DependencySourceType;
})(AI || (AI = {}));
// THIS TYPE WAS AUTOGENERATED
/// <reference path="Domain.ts" />
/// <reference path="DataPointType.ts" />
/// <reference path="DependencyKind.ts" />
/// <reference path="DependencySourceType.ts" />
var AI;
(function (AI) {
    "use strict";
    var RemoteDependencyData = (function (_super) {
        __extends(RemoteDependencyData, _super);
        function RemoteDependencyData() {
            _super.call(this);
            this.ver = 2;
            this.kind = AI.DataPointType.Aggregation;
            this.dependencyKind = AI.DependencyKind.Other;
            this.success = true;
            this.dependencySource = AI.DependencySourceType.Apmc;
            this.properties = {};
            this.measurements = {};
            _super.call(this);
        }
        return RemoteDependencyData;
    }(Microsoft.Telemetry.Domain));
    AI.RemoteDependencyData = RemoteDependencyData;
})(AI || (AI = {}));
/// <reference path="../../JavaScriptSDK.Interfaces/Telemetry/ISerializable.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/PageViewData.ts" />
/// <reference path="../../JavaScriptSDK.Interfaces/Contracts/Generated/RemoteDependencyData.ts"/>
/// <reference path="./Common/DataSanitizer.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        var Telemetry;
        (function (Telemetry) {
            "use strict";
            var RemoteDependencyData = (function (_super) {
                __extends(RemoteDependencyData, _super);
                /**
                 * Constructs a new instance of the RemoteDependencyData object
                 */
                function RemoteDependencyData(id, absoluteUrl, commandName, value, success, resultCode, method, properties, measurements) {
                    _super.call(this);
                    this.aiDataContract = {
                        id: ApplicationInsights.FieldType.Required,
                        ver: ApplicationInsights.FieldType.Required,
                        name: ApplicationInsights.FieldType.Default,
                        resultCode: ApplicationInsights.FieldType.Default,
                        duration: ApplicationInsights.FieldType.Default,
                        success: ApplicationInsights.FieldType.Default,
                        data: ApplicationInsights.FieldType.Default,
                        target: ApplicationInsights.FieldType.Default,
                        type: ApplicationInsights.FieldType.Default,
                        properties: ApplicationInsights.FieldType.Default,
                        measurements: ApplicationInsights.FieldType.Default,
                        kind: ApplicationInsights.FieldType.Default,
                        value: ApplicationInsights.FieldType.Default,
                        count: ApplicationInsights.FieldType.Default,
                        min: ApplicationInsights.FieldType.Default,
                        max: ApplicationInsights.FieldType.Default,
                        stdDev: ApplicationInsights.FieldType.Default,
                        dependencyKind: ApplicationInsights.FieldType.Default,
                        async: ApplicationInsights.FieldType.Default,
                        dependencySource: ApplicationInsights.FieldType.Default,
                        commandName: ApplicationInsights.FieldType.Default,
                        dependencyTypeName: ApplicationInsights.FieldType.Default,
                    };
                    this.id = id;
                    this.duration = ApplicationInsights.Util.msToTimeSpan(value);
                    this.success = success;
                    this.resultCode = resultCode + "";
                    this.dependencyKind = AI.DependencyKind.Http;
                    this.type = "Ajax";
                    this.data = Telemetry.Common.DataSanitizer.sanitizeUrl(commandName);
                    if (absoluteUrl && absoluteUrl.length > 0) {
                        var parsedUrl = ApplicationInsights.UrlHelper.parseUrl(absoluteUrl);
                        this.target = parsedUrl.host;
                        if (parsedUrl.pathname != null) {
                            var pathName = (parsedUrl.pathname.length === 0) ? "/" : parsedUrl.pathname;
                            if (pathName.charAt(0) !== '/') {
                                pathName = "/" + pathName;
                            }
                            this.name = Telemetry.Common.DataSanitizer.sanitizeString(method ? method + " " + pathName : pathName);
                        }
                        else {
                            this.name = Telemetry.Common.DataSanitizer.sanitizeString(absoluteUrl);
                        }
                    }
                    else {
                        this.target = commandName;
                        this.name = commandName;
                    }
                    this.properties = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeProperties(properties);
                    this.measurements = ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeMeasurements(measurements);
                }
                RemoteDependencyData.envelopeType = "Microsoft.ApplicationInsights.{0}.RemoteDependency";
                RemoteDependencyData.dataType = "RemoteDependencyData";
                return RemoteDependencyData;
            }(AI.RemoteDependencyData));
            Telemetry.RemoteDependencyData = RemoteDependencyData;
        })(Telemetry = ApplicationInsights.Telemetry || (ApplicationInsights.Telemetry = {}));
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="./HashCodeScoreGenerator.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        // Class allows to perform split testing (aka 'a/b testing' aka 'flights')
        // Works similarly to sampling, using the same hashing algorithm under the hood.
        // Suggested use:
        //
        //   newShinyFeature.enabled = false;
        //   if (new SplitTest.isEnabled(<user id>, <percent of users to enable feature for>)){
        //     newShinyFeature.enabled = true;
        //   }
        //
        var SplitTest = (function () {
            function SplitTest() {
                this.hashCodeGeneragor = new ApplicationInsights.HashCodeScoreGenerator();
            }
            SplitTest.prototype.isEnabled = function (key, percentEnabled) {
                return this.hashCodeGeneragor.getHashCodeScore(key) < percentEnabled;
            };
            return SplitTest;
        }());
        ApplicationInsights.SplitTest = SplitTest;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="./IConfig.ts" />
/// <reference path="./ITelemetryContext.ts" />
/// <reference path="./Contracts/Generated/SeverityLevel.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="telemetrycontext.ts" />
/// <reference path="./Telemetry/Common/Data.ts"/>
/// <reference path="./Util.ts"/>
/// <reference path="../JavaScriptSDK.Interfaces/Contracts/Generated/SessionState.ts"/>
/// <reference path="./Telemetry/PageViewManager.ts"/>
/// <reference path="./Telemetry/PageVisitTimeManager.ts"/>
/// <reference path="./Telemetry/RemoteDependencyData.ts"/>
/// <reference path="./ajax/ajax.ts"/>
/// <reference path="./SplitTest.ts"/>
/// <reference path="../JavaScriptSDK.Interfaces/IAppInsights.ts"/>
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        ApplicationInsights.Version = "1.0.8";
        /**
         * The main API that sends telemetry to Application Insights.
         * Learn more: http://go.microsoft.com/fwlink/?LinkID=401493
         */
        var AppInsights = (function () {
            function AppInsights(config) {
                var _this = this;
                // Counts number of trackAjax invokations.
                // By default we only monitor X ajax call per view to avoid too much load.
                // Default value is set in config.
                // This counter keeps increasing even after the limit is reached.
                this._trackAjaxAttempts = 0;
                this.config = config || {};
                // load default values if specified
                var defaults = AppInsights.defaultConfig;
                if (defaults !== undefined) {
                    for (var field in defaults) {
                        // for each unspecified field, set the default value
                        if (this.config[field] === undefined) {
                            this.config[field] = defaults[field];
                        }
                    }
                }
                ApplicationInsights._InternalLogging.verboseLogging = function () { return _this.config.verboseLogging; };
                ApplicationInsights._InternalLogging.enableDebugExceptions = function () { return _this.config.enableDebug; };
                var configGetters = {
                    instrumentationKey: function () { return _this.config.instrumentationKey; },
                    accountId: function () { return _this.config.accountId; },
                    sessionRenewalMs: function () { return _this.config.sessionRenewalMs; },
                    sessionExpirationMs: function () { return _this.config.sessionExpirationMs; },
                    endpointUrl: function () { return _this.config.endpointUrl; },
                    emitLineDelimitedJson: function () { return _this.config.emitLineDelimitedJson; },
                    maxBatchSizeInBytes: function () {
                        return (!_this.config.isBeaconApiDisabled && ApplicationInsights.Util.IsBeaconApiSupported()) ?
                            Math.min(_this.config.maxBatchSizeInBytes, ApplicationInsights.Sender.MaxBeaconPayloadSize) :
                            _this.config.maxBatchSizeInBytes;
                    },
                    maxBatchInterval: function () { return _this.config.maxBatchInterval; },
                    disableTelemetry: function () { return _this.config.disableTelemetry; },
                    sampleRate: function () { return _this.config.samplingPercentage; },
                    cookieDomain: function () { return _this.config.cookieDomain; },
                    enableSessionStorageBuffer: function () {
                        // Disable Session Storage buffer if telemetry is sent using Beacon API
                        return ((_this.config.isBeaconApiDisabled || !ApplicationInsights.Util.IsBeaconApiSupported()) && _this.config.enableSessionStorageBuffer);
                    },
                    isRetryDisabled: function () { return _this.config.isRetryDisabled; },
                    isBeaconApiDisabled: function () { return _this.config.isBeaconApiDisabled; }
                };
                if (this.config.isCookieUseDisabled) {
                    ApplicationInsights.Util.disableCookies();
                }
                if (this.config.isStorageUseDisabled) {
                    ApplicationInsights.Util.disableStorage();
                }
                this.context = new ApplicationInsights.TelemetryContext(configGetters);
                this._pageViewManager = new Microsoft.ApplicationInsights.Telemetry.PageViewManager(this, this.config.overridePageViewDuration);
                // initialize event timing
                this._eventTracking = new Timing("trackEvent");
                this._eventTracking.action = function (name, url, duration, properties, measurements) {
                    if (!measurements) {
                        measurements = { duration: duration };
                    }
                    else {
                        // do not override existing duration value
                        if (isNaN(measurements["duration"])) {
                            measurements["duration"] = duration;
                        }
                    }
                    var event = new ApplicationInsights.Telemetry.Event(name, properties, measurements);
                    var data = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.Event.dataType, event);
                    var envelope = new ApplicationInsights.Telemetry.Common.Envelope(data, ApplicationInsights.Telemetry.Event.envelopeType);
                    _this.context.track(envelope);
                };
                // initialize page view timing
                this._pageTracking = new Timing("trackPageView");
                this._pageTracking.action = function (name, url, duration, properties, measurements) {
                    _this.sendPageViewInternal(name, url, duration, properties, measurements);
                };
                this._pageVisitTimeManager = new ApplicationInsights.Telemetry.PageVisitTimeManager(function (pageName, pageUrl, pageVisitTime) { return _this.trackPageVisitTime(pageName, pageUrl, pageVisitTime); });
                if (!this.config.disableAjaxTracking) {
                    this._ajaxMonitor = new Microsoft.ApplicationInsights.AjaxMonitor(this);
                }
            }
            AppInsights.prototype.sendPageViewInternal = function (name, url, duration, properties, measurements) {
                var pageView = new ApplicationInsights.Telemetry.PageView(name, url, duration, properties, measurements);
                var data = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.PageView.dataType, pageView);
                var envelope = new ApplicationInsights.Telemetry.Common.Envelope(data, ApplicationInsights.Telemetry.PageView.envelopeType);
                this.context.track(envelope);
                // reset ajaxes counter
                this._trackAjaxAttempts = 0;
            };
            AppInsights.prototype.sendPageViewPerformanceInternal = function (pageViewPerformance) {
                var pageViewPerformanceData = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.PageViewPerformance.dataType, pageViewPerformance);
                var pageViewPerformanceEnvelope = new ApplicationInsights.Telemetry.Common.Envelope(pageViewPerformanceData, ApplicationInsights.Telemetry.PageViewPerformance.envelopeType);
                this.context.track(pageViewPerformanceEnvelope);
            };
            AppInsights.prototype.startTrackPage = function (param1, param2) {
                var name;
                var startDate;
                try {
                    if (param2 != null) {
                        name = param1;
                        startDate = param2;
                    }
                    else if (param1 != null) {
                        if (typeof param1 === "string") {
                            name = param1;
                            startDate = null;
                        }
                        else {
                            name = window.document && window.document.title || "";
                            startDate = param1;
                        }
                    }
                    else if (typeof param1 !== "string") {
                        name = window.document && window.document.title || "";
                    }
                    this._pageTracking.start(name, startDate);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.StartTrackFailed, "startTrackPage failed, page view may not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Logs how long a page or other item was visible, after {@link startTrackPage}. Call this when the page closes.
             * @param   name  The string you used as the name in startTrackPage. Defaults to the document title.
             * @param   url   String - a relative or absolute URL that identifies the page or other item. Defaults to the window location.
             * @param   properties  map[string, string] - additional data used to filter pages and metrics in the portal. Defaults to empty.
             * @param   measurements    map[string, number] - metrics associated with this page, displayed in Metrics Explorer on the portal. Defaults to empty.
             * @param   EndDate A date that identifies the original end date that will override the current date. Defaults to the current date.
             */
            AppInsights.prototype.stopTrackPage = function (name, url, properties, measurements, endDate) {
                try {
                    if (typeof name !== "string") {
                        name = window.document && window.document.title || "";
                    }
                    if (typeof url !== "string") {
                        url = window.location && window.location.href || "";
                    }
                    this._pageTracking.stop(name, url, properties, measurements, endDate);
                    if (this.config.autoTrackPageVisitTime) {
                        this._pageVisitTimeManager.trackPreviousPageVisit(name, url);
                    }
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.StopTrackFailed, "stopTrackPage failed, page view will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Logs that a page or other item was viewed.
             * @param   name  The string you used as the name in startTrackPage. Defaults to the document title.
             * @param   url   String - a relative or absolute URL that identifies the page or other item. Defaults to the window location.
             * @param   properties  map[string, string] - additional data used to filter pages and metrics in the portal. Defaults to empty.
             * @param   measurements    map[string, number] - metrics associated with this page, displayed in Metrics Explorer on the portal. Defaults to empty.
             * @param   duration    number - the number of milliseconds it took to load the page. Defaults to undefined. If set to default value, page load time is calculated internally.
             */
            AppInsights.prototype.trackPageView = function (name, url, properties, measurements, duration) {
                try {
                    this._pageViewManager.trackPageView(name, url, properties, measurements, duration);
                    if (this.config.autoTrackPageVisitTime) {
                        this._pageVisitTimeManager.trackPreviousPageVisit(name, url);
                    }
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TrackPVFailed, "trackPageView failed, page view will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Start timing an extended event. Call {@link stopTrackEvent} to log the event when it ends.
             * @param   name    A string that identifies this event uniquely within the document.
             */
            AppInsights.prototype.startTrackEvent = function (name) {
                try {
                    this._eventTracking.start(name);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.StartTrackEventFailed, "startTrackEvent failed, event will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Log an extended event that you started timing with {@link startTrackEvent}.
             * @param   name    The string you used to identify this event in startTrackEvent.
             * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
             * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
             */
            AppInsights.prototype.stopTrackEvent = function (name, properties, measurements) {
                try {
                    this._eventTracking.stop(name, undefined, properties, measurements);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.StopTrackEventFailed, "stopTrackEvent failed, event will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Log a user action or other occurrence.
             * @param   name    A string to identify this event in the portal.
             * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
             * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
             */
            AppInsights.prototype.trackEvent = function (name, properties, measurements) {
                try {
                    var eventTelemetry = new ApplicationInsights.Telemetry.Event(name, properties, measurements);
                    var data = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.Event.dataType, eventTelemetry);
                    var envelope = new ApplicationInsights.Telemetry.Common.Envelope(data, ApplicationInsights.Telemetry.Event.envelopeType);
                    this.context.track(envelope);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TrackEventFailed, "trackEvent failed, event will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Log a dependency call
             * @param id    unique id, this is used by the backend o correlate server requests. Use Util.newId() to generate a unique Id.
             * @param method    represents request verb (GET, POST, etc.)
             * @param absoluteUrl   absolute url used to make the dependency request
             * @param pathName  the path part of the absolute url
             * @param totalTime total request time
             * @param success   indicates if the request was sessessful
             * @param resultCode    response code returned by the dependency request
             * @param properties    map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
             * @param measurements  map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
             */
            AppInsights.prototype.trackDependency = function (id, method, absoluteUrl, pathName, totalTime, success, resultCode, properties, measurements) {
                if (this.config.maxAjaxCallsPerView === -1 ||
                    this._trackAjaxAttempts < this.config.maxAjaxCallsPerView) {
                    var dependency = new ApplicationInsights.Telemetry.RemoteDependencyData(id, absoluteUrl, pathName, totalTime, success, resultCode, method, properties, measurements);
                    var dependencyData = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.RemoteDependencyData.dataType, dependency);
                    var envelope = new ApplicationInsights.Telemetry.Common.Envelope(dependencyData, ApplicationInsights.Telemetry.RemoteDependencyData.envelopeType);
                    this.context.track(envelope);
                }
                else if (this._trackAjaxAttempts === this.config.maxAjaxCallsPerView) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.MaxAjaxPerPVExceeded, "Maximum ajax per page view limit reached, ajax monitoring is paused until the next trackPageView(). In order to increase the limit set the maxAjaxCallsPerView configuration parameter.", true);
                }
                ++this._trackAjaxAttempts;
            };
            /**
             * trackAjax method is obsolete, use trackDependency instead
             */
            AppInsights.prototype.trackAjax = function (id, absoluteUrl, pathName, totalTime, success, resultCode, method) {
                this.trackDependency(id, null, absoluteUrl, pathName, totalTime, success, resultCode);
            };
            /**
             * Log an exception you have caught.
             * @param   exception   An Error from a catch clause, or the string error message.
             * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
             * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
             * @param   severityLevel   AI.SeverityLevel - severity level
             */
            AppInsights.prototype.trackException = function (exception, handledAt, properties, measurements, severityLevel) {
                try {
                    if (!ApplicationInsights.Util.isError(exception)) {
                        // ensure that we have an error object (user could pass a string/message)
                        try {
                            throw new Error(exception);
                        }
                        catch (error) {
                            exception = error;
                        }
                    }
                    var exceptionTelemetry = new ApplicationInsights.Telemetry.Exception(exception, handledAt, properties, measurements, severityLevel);
                    var data = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.Exception.dataType, exceptionTelemetry);
                    var envelope = new ApplicationInsights.Telemetry.Common.Envelope(data, ApplicationInsights.Telemetry.Exception.envelopeType);
                    this.context.track(envelope);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TrackExceptionFailed, "trackException failed, exception will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Log a numeric value that is not associated with a specific event. Typically used to send regular reports of performance indicators.
             * To send a single measurement, use just the first two parameters. If you take measurements very frequently, you can reduce the
             * telemetry bandwidth by aggregating multiple measurements and sending the resulting average at intervals.
             * @param   name    A string that identifies the metric.
             * @param   average Number representing either a single measurement, or the average of several measurements.
             * @param   sampleCount The number of measurements represented by the average. Defaults to 1.
             * @param   min The smallest measurement in the sample. Defaults to the average.
             * @param   max The largest measurement in the sample. Defaults to the average.
             */
            AppInsights.prototype.trackMetric = function (name, average, sampleCount, min, max, properties) {
                try {
                    var telemetry = new ApplicationInsights.Telemetry.Metric(name, average, sampleCount, min, max, properties);
                    var data = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.Metric.dataType, telemetry);
                    var envelope = new ApplicationInsights.Telemetry.Common.Envelope(data, ApplicationInsights.Telemetry.Metric.envelopeType);
                    this.context.track(envelope);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.TrackMetricFailed, "trackMetric failed, metric will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
            * Log a diagnostic message.
            * @param    message A message string
            * @param   properties  map[string, string] - additional data used to filter traces in the portal. Defaults to empty.
            */
            AppInsights.prototype.trackTrace = function (message, properties) {
                try {
                    var telemetry = new ApplicationInsights.Telemetry.Trace(message, properties);
                    var data = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.Trace.dataType, telemetry);
                    var envelope = new ApplicationInsights.Telemetry.Common.Envelope(data, ApplicationInsights.Telemetry.Trace.envelopeType);
                    this.context.track(envelope);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.TrackTraceFailed, "trackTrace failed, trace will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
           * Log a page visit time
           * @param    pageName    Name of page
           * @param    pageVisitDuration Duration of visit to the page in milleseconds
           */
            AppInsights.prototype.trackPageVisitTime = function (pageName, pageUrl, pageVisitTime) {
                var properties = { PageName: pageName, PageUrl: pageUrl };
                this.trackMetric("PageVisitTime", pageVisitTime, 1, pageVisitTime, pageVisitTime, properties);
            };
            /**
             * Immediately send all queued telemetry.
             */
            AppInsights.prototype.flush = function () {
                try {
                    this.context._sender.triggerSend();
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.FlushFailed, "flush failed, telemetry will not be collected: " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) });
                }
            };
            /**
             * Sets the autheticated user id and the account id in this session.
             * User auth id and account id should be of type string. They should not contain commas, semi-colons, equal signs, spaces, or vertical-bars.
             *
             * @param authenticatedUserId {string} - The authenticated user id. A unique and persistent string that represents each authenticated user in the service.
             * @param accountId {string} - An optional string to represent the account associated with the authenticated user.
             */
            AppInsights.prototype.setAuthenticatedUserContext = function (authenticatedUserId, accountId) {
                try {
                    this.context.user.setAuthenticatedUserContext(authenticatedUserId, accountId);
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.SetAuthContextFailed, "Setting auth user context failed. " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) }, true);
                }
            };
            /**
             * Clears the authenticated user id and the account id from the user context.
             */
            AppInsights.prototype.clearAuthenticatedUserContext = function () {
                try {
                    this.context.user.clearAuthenticatedUserContext();
                }
                catch (e) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.SetAuthContextFailed, "Clearing auth user context failed. " + ApplicationInsights.Util.getExceptionName(e), { exception: ApplicationInsights.Util.dump(e) }, true);
                }
            };
            /**
            * In case of CORS exceptions - construct an exception manually.
            * See this for more info: http://stackoverflow.com/questions/5913978/cryptic-script-error-reported-in-javascript-in-chrome-and-firefox
            */
            AppInsights.prototype.SendCORSException = function (properties) {
                var exceptionData = Microsoft.ApplicationInsights.Telemetry.Exception.CreateSimpleException("Script error.", "Error", "unknown", "unknown", "The browser's same-origin policy prevents us from getting the details of this exception.The exception occurred in a script loaded from an origin different than the web page.For cross- domain error reporting you can use crossorigin attribute together with appropriate CORS HTTP headers.For more information please see http://www.w3.org/TR/cors/.", 0, null);
                exceptionData.properties = properties;
                var data = new ApplicationInsights.Telemetry.Common.Data(ApplicationInsights.Telemetry.Exception.dataType, exceptionData);
                var envelope = new ApplicationInsights.Telemetry.Common.Envelope(data, ApplicationInsights.Telemetry.Exception.envelopeType);
                this.context.track(envelope);
            };
            /**
             * The custom error handler for Application Insights
             * @param {string} message - The error message
             * @param {string} url - The url where the error was raised
             * @param {number} lineNumber - The line number where the error was raised
             * @param {number} columnNumber - The column number for the line where the error was raised
             * @param {Error}  error - The Error object
             */
            AppInsights.prototype._onerror = function (message, url, lineNumber, columnNumber, error) {
                try {
                    var properties = { url: url ? url : document.URL };
                    if (ApplicationInsights.Util.isCrossOriginError(message, url, lineNumber, columnNumber, error)) {
                        this.SendCORSException(properties);
                    }
                    else {
                        if (!ApplicationInsights.Util.isError(error)) {
                            var stack = "window.onerror@" + properties.url + ":" + lineNumber + ":" + (columnNumber || 0);
                            error = new Error(message);
                            error["stack"] = stack;
                        }
                        this.trackException(error, null, properties);
                    }
                }
                catch (exception) {
                    var errorString = error ? (error.name + ", " + error.message) : "null";
                    var exceptionDump = ApplicationInsights.Util.dump(exception);
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.CRITICAL, ApplicationInsights._InternalMessageId.ExceptionWhileLoggingError, "_onerror threw exception while logging error, error will not be collected: " + ApplicationInsights.Util.getExceptionName(exception), { exception: exceptionDump, errorString: errorString });
                }
            };
            return AppInsights;
        }());
        ApplicationInsights.AppInsights = AppInsights;
        /**
         * Used to record timed events and page views.
         */
        var Timing = (function () {
            function Timing(name) {
                this._name = name;
                this._events = {};
            }
            Timing.prototype.start = function (name, startDate) {
                if (typeof this._events[name] !== "undefined") {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.StartCalledMoreThanOnce, "start was called more than once for this event without calling stop.", { name: this._name, key: name }, true);
                }
                if (startDate) {
                    this._events[name] = +startDate;
                }
                else {
                    this._events[name] = +new Date;
                }
            };
            Timing.prototype.stop = function (name, url, properties, measurements, endDate) {
                var start = this._events[name];
                if (isNaN(start)) {
                    ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.StopCalledWithoutStart, "stop was called without a corresponding start.", { name: this._name, key: name }, true);
                }
                else {
                    var end;
                    if (endDate) {
                        end = +endDate;
                    }
                    else {
                        end = +new Date;
                    }
                    var duration = ApplicationInsights.Telemetry.PageViewPerformance.getDuration(start, end);
                    this.action(name, url, duration, properties, measurements);
                }
                delete this._events[name];
                this._events[name] = undefined;
            };
            return Timing;
        }());
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="appinsights.ts" />
var Microsoft;
(function (Microsoft) {
    var ApplicationInsights;
    (function (ApplicationInsights) {
        "use strict";
        var Initialization = (function () {
            function Initialization(snippet) {
                // initialize the queue and config in case they are undefined
                snippet.queue = snippet.queue || [];
                var config = snippet.config || {};
                // ensure instrumentationKey is specified
                if (config && !config.instrumentationKey) {
                    config = snippet;
                    // check for legacy instrumentation key
                    if (config["iKey"]) {
                        Microsoft.ApplicationInsights.Version = "0.10.0.0";
                        config.instrumentationKey = config["iKey"];
                    }
                    else if (config["applicationInsightsId"]) {
                        Microsoft.ApplicationInsights.Version = "0.7.2.0";
                        config.instrumentationKey = config["applicationInsightsId"];
                    }
                    else {
                        throw new Error("Cannot load Application Insights SDK, no instrumentationKey was provided.");
                    }
                }
                // set default values
                config = Initialization.getDefaultConfig(config);
                this.snippet = snippet;
                this.config = config;
            }
            // note: these are split into methods to enable unit tests
            Initialization.prototype.loadAppInsights = function () {
                // initialize global instance of appInsights
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(this.config);
                // implement legacy version of trackPageView for 0.10<
                if (this.config["iKey"]) {
                    var originalTrackPageView = appInsights.trackPageView;
                    appInsights.trackPageView = function (pagePath, properties, measurements) {
                        originalTrackPageView.apply(appInsights, [null, pagePath, properties, measurements]);
                    };
                }
                // implement legacy pageView interface if it is present in the snippet
                var legacyPageView = "logPageView";
                if (typeof this.snippet[legacyPageView] === "function") {
                    appInsights[legacyPageView] = function (pagePath, properties, measurements) {
                        appInsights.trackPageView(null, pagePath, properties, measurements);
                    };
                }
                // implement legacy event interface if it is present in the snippet
                var legacyEvent = "logEvent";
                if (typeof this.snippet[legacyEvent] === "function") {
                    appInsights[legacyEvent] = function (name, properties, measurements) {
                        appInsights.trackEvent(name, properties, measurements);
                    };
                }
                return appInsights;
            };
            Initialization.prototype.emptyQueue = function () {
                // call functions that were queued before the main script was loaded
                try {
                    if (Microsoft.ApplicationInsights.Util.isArray(this.snippet.queue)) {
                        // note: do not check length in the for-loop conditional in case something goes wrong and the stub methods are not overridden.
                        var length = this.snippet.queue.length;
                        for (var i = 0; i < length; i++) {
                            var call = this.snippet.queue[i];
                            call();
                        }
                        this.snippet.queue = undefined;
                        delete this.snippet.queue;
                    }
                }
                catch (exception) {
                    var properties = {};
                    if (exception && typeof exception.toString === "function") {
                        properties.exception = exception.toString();
                    }
                    Microsoft.ApplicationInsights._InternalLogging.throwInternal(ApplicationInsights.LoggingSeverity.WARNING, ApplicationInsights._InternalMessageId.FailedToSendQueuedTelemetry, "Failed to send queued telemetry", properties);
                }
            };
            Initialization.prototype.pollInteralLogs = function (appInsightsInstance) {
                return setInterval(function () {
                    var queue = Microsoft.ApplicationInsights._InternalLogging.queue;
                    var length = queue.length;
                    for (var i = 0; i < length; i++) {
                        appInsightsInstance.trackTrace(queue[i].message);
                    }
                    queue.length = 0;
                }, this.config.diagnosticLogInterval);
            };
            Initialization.prototype.addHousekeepingBeforeUnload = function (appInsightsInstance) {
                // Add callback to push events when the user navigates away
                if (!appInsightsInstance.config.disableFlushOnBeforeUnload && ('onbeforeunload' in window)) {
                    var performHousekeeping = function () {
                        // Adds the ability to flush all data before the page unloads.
                        // Note: This approach tries to push an async request with all the pending events onbeforeunload.
                        // Firefox does not respect this.Other browsers DO push out the call with < 100% hit rate.
                        // Telemetry here will help us analyze how effective this approach is.
                        // Another approach would be to make this call sync with a acceptable timeout to reduce the 
                        // impact on user experience.
                        appInsightsInstance.context._sender.triggerSend();
                        // Back up the current session to local storage
                        // This lets us close expired sessions after the cookies themselves expire
                        appInsightsInstance.context._sessionManager.backup();
                    };
                    if (!Microsoft.ApplicationInsights.Util.addEventHandler('beforeunload', performHousekeeping)) {
                        Microsoft.ApplicationInsights._InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, Microsoft.ApplicationInsights._InternalMessageId.FailedToAddHandlerForOnBeforeUnload, 'Could not add handler for beforeunload');
                    }
                }
            };
            Initialization.getDefaultConfig = function (config) {
                if (!config) {
                    config = {};
                }
                // set default values
                config.endpointUrl = config.endpointUrl || "https://dc.services.visualstudio.com/v2/track";
                config.sessionRenewalMs = 30 * 60 * 1000;
                config.sessionExpirationMs = 24 * 60 * 60 * 1000;
                config.maxBatchSizeInBytes = config.maxBatchSizeInBytes > 0 ? config.maxBatchSizeInBytes : 102400; // 100kb
                config.maxBatchInterval = !isNaN(config.maxBatchInterval) ? config.maxBatchInterval : 15000;
                config.enableDebug = ApplicationInsights.Util.stringToBoolOrDefault(config.enableDebug);
                config.disableExceptionTracking = ApplicationInsights.Util.stringToBoolOrDefault(config.disableExceptionTracking);
                config.disableTelemetry = ApplicationInsights.Util.stringToBoolOrDefault(config.disableTelemetry);
                config.verboseLogging = ApplicationInsights.Util.stringToBoolOrDefault(config.verboseLogging);
                config.emitLineDelimitedJson = ApplicationInsights.Util.stringToBoolOrDefault(config.emitLineDelimitedJson);
                config.diagnosticLogInterval = config.diagnosticLogInterval || 10000;
                config.autoTrackPageVisitTime = ApplicationInsights.Util.stringToBoolOrDefault(config.autoTrackPageVisitTime);
                if (isNaN(config.samplingPercentage) || config.samplingPercentage <= 0 || config.samplingPercentage >= 100) {
                    config.samplingPercentage = 100;
                }
                config.disableAjaxTracking = ApplicationInsights.Util.stringToBoolOrDefault(config.disableAjaxTracking);
                config.maxAjaxCallsPerView = !isNaN(config.maxAjaxCallsPerView) ? config.maxAjaxCallsPerView : 500;
                config.isBeaconApiDisabled = ApplicationInsights.Util.stringToBoolOrDefault(config.isBeaconApiDisabled, true);
                config.disableCorrelationHeaders = ApplicationInsights.Util.stringToBoolOrDefault(config.disableCorrelationHeaders, true);
                config.disableFlushOnBeforeUnload = ApplicationInsights.Util.stringToBoolOrDefault(config.disableFlushOnBeforeUnload);
                config.enableSessionStorageBuffer = ApplicationInsights.Util.stringToBoolOrDefault(config.enableSessionStorageBuffer, true);
                config.isRetryDisabled = ApplicationInsights.Util.stringToBoolOrDefault(config.isRetryDisabled);
                config.isCookieUseDisabled = ApplicationInsights.Util.stringToBoolOrDefault(config.isCookieUseDisabled);
                config.isStorageUseDisabled = ApplicationInsights.Util.stringToBoolOrDefault(config.isStorageUseDisabled);
                return config;
            };
            return Initialization;
        }());
        ApplicationInsights.Initialization = Initialization;
    })(ApplicationInsights = Microsoft.ApplicationInsights || (Microsoft.ApplicationInsights = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../javascriptsdk/appinsights.ts" />
/// <reference path="../../javascriptsdk/initialization.ts" />
var SenderE2ETests = (function (_super) {
    __extends(SenderE2ETests, _super);
    function SenderE2ETests() {
        _super.apply(this, arguments);
        this.maxBatchInterval = 100;
    }
    /** Method called before the start of each test method */
    SenderE2ETests.prototype.testInitialize = function () {
        this.useFakeServer = false;
        sinon.fakeServer["restore"]();
        this.useFakeTimers = false;
        this.clock.restore();
    };
    /** Method called after each test method has completed */
    SenderE2ETests.prototype.testCleanup = function () {
        this.useFakeServer = true;
        this.useFakeTimers = true;
    };
    SenderE2ETests.prototype.getAiClient = function (config) {
        config.maxBatchInterval = this.maxBatchInterval;
        config.endpointUrl = "https://dc.services.visualstudio.com/v2/track";
        config.instrumentationKey = "3e6a441c-b52b-4f39-8944-f81dd6c2dc46";
        return new Microsoft.ApplicationInsights.AppInsights(config);
    };
    SenderE2ETests.prototype.registerTests = function () {
        var _this = this;
        this.delay = this.maxBatchInterval + 100;
        this.testCaseAsync({
            name: "TelemetryContext: send event using Beacon API",
            stepDelay: this.delay,
            steps: [
                function () {
                    var config = Microsoft.ApplicationInsights.Initialization.getDefaultConfig();
                    config.isBeaconApiDisabled = false;
                    _this.aiClient = _this.getAiClient(config);
                    _this.beaconSpy = _this.sandbox.spy(navigator, "sendBeacon");
                    _this.aiClient.trackEvent("test");
                },
                function () {
                    Assert.ok(_this.beaconSpy.calledOnce);
                    var payload = _this.beaconSpy.args[0][1];
                    Assert.ok(payload.indexOf('{"baseType":"EventData","baseData":{"ver":2,"name":"test"}}') >= 0);
                }
            ]
        });
    };
    return SenderE2ETests;
}(TestClass));
new SenderE2ETests().registerTests();
