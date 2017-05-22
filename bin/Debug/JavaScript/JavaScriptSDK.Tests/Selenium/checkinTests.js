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
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/appInsights.ts" />
/// <reference path="../../JavaScriptSDK/Util.ts"/>
var AppInsightsTests = (function (_super) {
    __extends(AppInsightsTests, _super);
    function AppInsightsTests() {
        _super.apply(this, arguments);
    }
    AppInsightsTests.prototype.getAppInsightsSnippet = function () {
        var snippet = {
            instrumentationKey: "",
            endpointUrl: "https://dc.services.visualstudio.com/v2/track",
            emitLineDelimitedJson: false,
            accountId: undefined,
            sessionRenewalMs: 10,
            sessionExpirationMs: 10,
            maxBatchSizeInBytes: 1000000,
            maxBatchInterval: 1,
            enableDebug: false,
            disableExceptionTracking: false,
            disableTelemetry: false,
            verboseLogging: false,
            diagnosticLogInterval: 1000,
            autoTrackPageVisitTime: false,
            samplingPercentage: 100,
            disableAjaxTracking: true,
            overridePageViewDuration: false,
            maxAjaxCallsPerView: 20,
            cookieDomain: undefined,
            disableDataLossAnalysis: true,
            disableCorrelationHeaders: false,
            disableFlushOnBeforeUnload: false,
            enableSessionStorageBuffer: false,
            isCookieUseDisabled: false,
            isRetryDisabled: false,
            isStorageUseDisabled: false,
            isBeaconApiDisabled: true
        };
        // set default values
        return snippet;
    };
    AppInsightsTests.prototype.testInitialize = function () {
        this.clock.reset();
        Microsoft.ApplicationInsights.Util.setCookie('ai_session', "");
        Microsoft.ApplicationInsights.Util.setCookie('ai_user', "");
        if (Microsoft.ApplicationInsights.Util.canUseLocalStorage()) {
            window.localStorage.clear();
        }
    };
    AppInsightsTests.prototype.testCleanup = function () {
        Microsoft.ApplicationInsights.Util.setCookie('ai_session', "");
        Microsoft.ApplicationInsights.Util.setCookie('ai_user', "");
        if (Microsoft.ApplicationInsights.Util.canUseLocalStorage()) {
            window.localStorage.clear();
        }
    };
    AppInsightsTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "AppInsightsTests: public members are correct",
            test: function () {
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var leTest = function (name) {
                    Assert.ok(name in appInsights, name + " exists");
                };
                var members = ["context"];
                while (members.length) {
                    leTest(members.pop());
                }
            }
        });
        this.testCase({
            name: "AppInsightsTests: public methods are correct",
            test: function () {
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var leTest = function (name) {
                    Assert.ok(name in appInsights, name + " exists");
                    Assert.ok(typeof appInsights[name] === "function", name + " is a method");
                };
                var methods = ["trackTrace", "trackEvent", "trackMetric", "trackException", "trackPageView", "trackAjax"];
                while (methods.length) {
                    leTest(methods.pop());
                }
            }
        });
        this.testCase({
            name: "AppInsightsTests: master off switch can disable sending data",
            test: function () {
                // setup
                var config = _this.getAppInsightsSnippet();
                config.disableTelemetry = true;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(config);
                appInsights.context._sender._sender = function () { return null; };
                var senderStub = _this.sandbox.stub(appInsights.context._sender, "_sender", function () {
                    console.log("GOT HERE");
                });
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    Assert.ok(senderStub.notCalled, "sender was not called called for: " + action);
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: track page view performance",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // act
                appInsights.trackPageView();
                // act
                _this.clock.tick(100);
                // verify
                Assert.ok(trackStub.calledTwice, "track was called");
            }
        });
        this.testCase({
            name: "AppInsightsTests: envelope type, data type and ikey are correct",
            test: function () {
                // setup
                var iKey = "BDC8736D-D8E8-4B69-B19B-B0CE6B66A456";
                var iKeyNoDash = "BDC8736DD8E84B69B19BB0CE6B66A456";
                var config = _this.getAppInsightsSnippet();
                config.instrumentationKey = iKey;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(config);
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action, expectedEnvelopeType, expectedDataType) {
                    action();
                    var envelope = _this.getFirstResult(action, trackStub);
                    Assert.equal(iKey, envelope.iKey, "envelope iKey");
                    Assert.equal(expectedEnvelopeType.replace("{0}", iKeyNoDash), envelope.name, "envelope name");
                    Assert.equal(expectedDataType, envelope.data.baseType, "type name");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); }, Microsoft.ApplicationInsights.Telemetry.Event.envelopeType, Microsoft.ApplicationInsights.Telemetry.Event.dataType);
            }
        });
        this.testCase({
            name: "AppInsightsTests: envelope time is correct",
            test: function () {
                // setup
                var config = _this.getAppInsightsSnippet();
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(config);
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(60000);
                // act 
                appInsights.trackEvent("testEvent");
                // verify
                var envelope = _this.getFirstResult("track was called", trackStub);
                Assert.equal(60000, new Date(envelope.time).getTime(), "envelope time");
            }
        });
        this.testCase({
            name: "AppInsightsTests: application context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.application.ver = "101";
                appInsights.context.application.build = "101";
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("101", envelope.tags[contextKeys.applicationVersion], "application.ver");
                    Assert.equal("101", envelope.tags[contextKeys.applicationBuild], "application.build");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: device context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.device.id = "101";
                appInsights.context.device.ip = "101";
                appInsights.context.device.language = "101";
                appInsights.context.device.locale = "101";
                appInsights.context.device.model = "101";
                appInsights.context.device.network = 101;
                appInsights.context.device.oemName = "101";
                appInsights.context.device.os = "101";
                appInsights.context.device.osversion = "101";
                appInsights.context.device.resolution = "101";
                appInsights.context.device.type = "101";
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("101", envelope.tags[contextKeys.deviceId], "device.id");
                    Assert.equal("101", envelope.tags[contextKeys.deviceIp], "device.ip");
                    Assert.equal("101", envelope.tags[contextKeys.deviceLanguage], "device.language");
                    Assert.equal("101", envelope.tags[contextKeys.deviceLocale], "device.locale");
                    Assert.equal("101", envelope.tags[contextKeys.deviceModel], "device.model");
                    Assert.equal("101", envelope.tags[contextKeys.deviceNetwork], "device.network");
                    Assert.equal("101", envelope.tags[contextKeys.deviceOEMName], "device.oemName");
                    Assert.equal("101", envelope.tags[contextKeys.deviceOS], "device.os");
                    Assert.equal("101", envelope.tags[contextKeys.deviceOSVersion], "device.osversion");
                    Assert.equal("101", envelope.tags[contextKeys.deviceScreenResolution], "device.resolution");
                    Assert.equal("101", envelope.tags[contextKeys.deviceType], "device.type");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: internal context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.internal.agentVersion = "101";
                appInsights.context.internal.sdkVersion = "101";
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("101", envelope.tags[contextKeys.internalAgentVersion], "internal.agentVersion");
                    Assert.equal("101", envelope.tags[contextKeys.internalSdkVersion], "internal.sdkVersion");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: location context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.location.ip = "101";
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("101", envelope.tags[contextKeys.locationIp], "location.ip");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: operation context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.operation.id = "101";
                appInsights.context.operation.name = "101";
                appInsights.context.operation.parentId = "101";
                appInsights.context.operation.rootId = "101";
                appInsights.context.operation.syntheticSource = "101";
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("101", envelope.tags[contextKeys.operationId], "operation.id");
                    Assert.equal("101", envelope.tags[contextKeys.operationName], "operation.name");
                    Assert.equal("101", envelope.tags[contextKeys.operationParentId], "operation.parentId");
                    Assert.equal("101", envelope.tags[contextKeys.operationRootId], "operation.rootId");
                    Assert.equal("101", envelope.tags[contextKeys.operationSyntheticSource], "operation.syntheticSource");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: sample context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.sample.sampleRate = 33;
                var trackSpy = _this.sandbox.spy(appInsights.context, "_track");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = trackSpy.returnValues[0];
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal(33, envelope.sampleRate, "sample.sampleRate");
                    trackSpy.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: appInsights.context.sample.IsSampledIn() receives an envelope with sampling-related contexts applied (sample, user)",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.sample.sampleRate = 33;
                appInsights.context.user.id = "asdf";
                var trackSpy = _this.sandbox.spy(appInsights.context.sample, "isSampledIn");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    //var envelope = this.getFirstResult(action, trackStub);
                    var envelope = trackSpy.args[0][0];
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal(33, envelope.sampleRate, "sample.sampleRate");
                    Assert.equal("asdf", envelope.tags[contextKeys.userId], "user.id");
                    trackSpy.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
                var pageViewTimeout = 100; // page views are sent with 100 ms delay (see trackPageView implementation).
                test(function () { appInsights.trackPageView(); _this.clock.tick(pageViewTimeout); });
                test(function () { return appInsights.trackException(new Error()); });
                test(function () { return appInsights.trackTrace("testTrace"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: session context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.session.id = "101";
                appInsights.context.session.isFirst = true;
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("101", envelope.tags[contextKeys.sessionId], "session.id");
                    Assert.equal(true, envelope.tags[contextKeys.sessionIsFirst], "session.isFirstSession");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: user context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.context.user.accountId = "101";
                appInsights.context.user.agent = "101";
                appInsights.context.user.id = "101";
                appInsights.context.user.storeRegion = "101";
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("101", envelope.tags[contextKeys.userAccountId], "user.accountId");
                    Assert.equal("101", envelope.tags[contextKeys.userAgent], "user.agent");
                    Assert.equal("101", envelope.tags[contextKeys.userId], "user.id");
                    Assert.equal("101", envelope.tags[contextKeys.userStoreRegion], "user.storeRegion");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: set authenticatedId context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.setAuthenticatedUserContext("10001");
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("10001", envelope.tags[contextKeys.userAuthUserId], "user.authenticatedId");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: set authenticatedId and accountId context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.setAuthenticatedUserContext("10001", "account33");
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("10001", envelope.tags[contextKeys.userAuthUserId], "user.authenticatedId");
                    Assert.equal("account33", envelope.tags[contextKeys.userAccountId], "user.accountId");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: set authenticatedId and accountId context is applied with non-ascii languages",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.setAuthenticatedUserContext("\u0428", "\u0429"); // Cyrillic characters
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal("\u0428", envelope.tags[contextKeys.userAuthUserId], "user.authenticatedId is correct");
                    Assert.equal("\u0429", envelope.tags[contextKeys.userAccountId], "user.accountId is correct");
                    trackStub.reset();
                };
                // act 
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: clear authID context is applied",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                appInsights.setAuthenticatedUserContext("1234", "abcd");
                // Clear authenticatedId
                appInsights.clearAuthenticatedUserContext();
                // verify
                var test = function (action) {
                    action();
                    _this.clock.tick(1);
                    var envelope = _this.getFirstResult(action, trackStub);
                    var contextKeys = new AI.ContextTagKeys();
                    Assert.equal(undefined, envelope.tags[contextKeys.userAuthUserId], "user.authenticatedId");
                    Assert.equal(undefined, envelope.tags[contextKeys.userAccountId], "user.accountId");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackEvent("testEvent"); });
            }
        });
        this.testCase({
            name: "AppInsightsTests: trackPageView sends user-specified duration when passed",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                snippet.overridePageViewDuration = true;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var spy = _this.sandbox.spy(appInsights, "sendPageViewInternal");
                // act
                appInsights.trackPageView(null, null, null, null, 124);
                // verify
                Assert.ok(spy.calledOnce, "sendPageViewInternal is called");
                Assert.equal(124, spy.args[0][2], "PageView duration doesn't match expected value");
            }
        });
        this.testCase({
            name: "AppInsightsTests: trackPageView sends user-specified duration when 0 passed",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                snippet.overridePageViewDuration = true;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var spy = _this.sandbox.spy(appInsights, "sendPageViewInternal");
                // act
                appInsights.trackPageView(null, null, null, null, 0);
                // verify
                Assert.ok(spy.calledOnce, "sendPageViewInternal is called");
                Assert.equal(0, spy.args[0][2], "PageView duration doesn't match expected value");
            }
        });
        this.testCase({
            name: "AppInsightsTests: trackPageView sends custom duration when configured by user",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                snippet.overridePageViewDuration = true;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var spy = _this.sandbox.spy(appInsights, "sendPageViewInternal");
                var stub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                    return { navigationStart: 0 };
                });
                var getDurationMsStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.prototype, "getDurationMs", function () {
                    return 54321;
                });
                // act
                _this.clock.tick(123);
                appInsights.trackPageView();
                // verify
                Assert.ok(spy.calledOnce, "sendPageViewInternal is called");
                Assert.equal(123, spy.args[0][2], "PageView duration doesn't match expected value");
            }
        });
        this.testCase({
            name: "AppInsightsTests: by default trackPageView gets the data from page view performance when it's available",
            test: function () {
                // setup
                var expectedDuration = 123;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var spy = _this.sandbox.stub(appInsights, "sendPageViewInternal");
                var checkPageLoadStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "isPerformanceTimingDataReady", function () { return true; });
                var getDurationStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.prototype, "getDurationMs", function () { return expectedDuration; });
                // act
                appInsights.trackPageView();
                // Data not available yet - should not send events
                _this.clock.tick(100);
                Assert.ok(spy.calledOnce, "Data is available so page view should be sent");
                Assert.equal(expectedDuration, spy.args[0][2], "Page view duration taken from page view performance object doesn't match expected value");
            }
        });
        this.testCase({
            name: "AppInsightsTests: if performance data is no valid then trackPageView sends page view with duration equal time to spent from navigation start time till calling into trackPageView",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var spy = _this.sandbox.stub(appInsights, "sendPageViewInternal");
                var checkPageLoadStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "isPerformanceTimingDataReady", function () { return true; });
                var getIsValidStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.prototype, "getIsValid", function () { return false; });
                var stub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                    return { navigationStart: 0 };
                });
                _this.clock.tick(50);
                // act
                appInsights.trackPageView();
                // Data not available yet - should not send events
                _this.clock.tick(100);
                Assert.ok(spy.called, "Page view should not be sent since the timing data is invalid");
                Assert.equal(50, spy.args[0][2], "Page view duration should be equal to time from navigation start to when trackPageView is called (aka 'override page view duration' mode)");
            }
        });
        this.testCase({
            name: "AppInsightsTests: if in 'override page view duration' mode, trackPageView won't report duration if it exceeded max duration",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var spy = _this.sandbox.stub(appInsights, "sendPageViewInternal");
                var checkPageLoadStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "isPerformanceTimingDataReady", function () { return true; });
                var getIsValidStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.prototype, "getIsValid", function () { return false; });
                var stub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                    return { navigationStart: 0 };
                });
                _this.clock.tick(3600000);
                // mock user agent
                var originalUserAgent = navigator.userAgent;
                _this.setUserAgent("Googlebot/2.1");
                // act
                appInsights.trackPageView();
                // Data not available yet - should not send events
                _this.clock.tick(100);
                Assert.ok(spy.called, "Page view should not be sent since the timing data is invalid");
                Assert.equal(undefined, spy.args[0][2], "Page view duration should be undefined if it's coming from GoogleBot and is >=1h");
                // restore original user agent
                _this.setUserAgent(originalUserAgent);
            }
        });
        this.testCase({
            name: "AppInsightsTests: trackPageView sends base data and performance data when available",
            test: function () {
                // setup
                var perfDataAvailable = false;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var triggerStub = _this.sandbox.stub(appInsights.context, "track");
                var checkPageLoadStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "isPerformanceTimingDataReady", function () { return perfDataAvailable; });
                // act
                appInsights.trackPageView();
                // Data not available yet - should not send events
                _this.clock.tick(100);
                Assert.ok(triggerStub.notCalled, "Data is not yet available hence nothing is sent");
                // Data becomes available - both page view and client perf should be sent
                perfDataAvailable = true;
                _this.clock.tick(100);
                Assert.ok(triggerStub.calledTwice, "Data is available hence both page view and client perf should be sent");
            }
        });
        this.testCase({
            name: "AppInsightsTests: a page view is sent after 60 seconds even if perf data is not available",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var spy = _this.sandbox.stub(appInsights, "sendPageViewInternal");
                var checkPageLoadStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "isPerformanceTimingDataReady", function () { return false; });
                var stub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                    return { navigationStart: 0 };
                });
                // act
                appInsights.trackPageView();
                // 60+ seconds passed, page view is supposed to be sent                
                _this.clock.tick(65432);
                Assert.ok(spy.calledOnce, "60 seconds passed, page view is supposed to be sent");
                Assert.equal(60000, spy.args[0][2], "Page view duration doesn't match expected maximum duration (60000 ms)");
            }
        });
        this.testCase({
            name: "AppInsightsTests: a page view is sent with undefined duration if navigation timing API is not supported",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var spy = _this.sandbox.stub(appInsights, "sendPageViewInternal");
                var checkPageLoadStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "isPerformanceTimingSupported", function () { return false; });
                // act
                appInsights.trackPageView();
                _this.clock.tick(100);
                // assert
                Assert.ok(spy.calledOnce, "sendPageViewInternal should be called even if navigation timing is not supported");
                Assert.equal(undefined, spy.args[0][2], "Page view duration should be `undefined`");
            }
        });
        this.testCase({
            name: "AppInsightsTests: trackException accepts single exception and an array of exceptions",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                appInsights.trackException(new Error());
                Assert.ok(trackStub.calledOnce, "single exception is tracked");
                appInsights.trackException([new Error()]);
                Assert.ok(trackStub.calledTwice, "array of exceptions is tracked");
            }
        });
        this.testCase({
            name: "AppInsightsTests: trackException allows logging errors with different severity level",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context, "track");
                appInsights.trackException(new Error(), "test", null, null, AI.SeverityLevel.Critical);
                Assert.ok(trackStub.calledOnce, "single exception is tracked");
                Assert.equal(AI.SeverityLevel.Critical, trackStub.firstCall.args[0].data.baseData.severityLevel);
                trackStub.reset();
                appInsights.trackException(new Error(), "test", null, null, AI.SeverityLevel.Error);
                Assert.ok(trackStub.calledOnce, "single exception is tracked");
                Assert.equal(AI.SeverityLevel.Error, trackStub.firstCall.args[0].data.baseData.severityLevel);
            }
        });
        this.testCase({
            name: "AppInsightsTests: trackMetric batches metrics sent in a hot loop",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // act 
                appInsights.trackMetric("testMetric", 0);
                _this.clock.tick(1);
                // verify
                Assert.ok(trackStub.calledOnce, "track was called once after sending one metric");
                trackStub.reset();
                // act
                for (var i = 0; i < 100; i++) {
                    appInsights.trackMetric("testMetric", 0);
                }
                _this.clock.tick(1);
                // verify
                Assert.equal(100, trackStub.callCount, "track was called 100 times");
            }
        });
        this.testCase({
            name: "AppInsightsTests: config methods are set based on snippet",
            test: function () {
                // setup
                var snippet = _this.getAppInsightsSnippet();
                snippet.cookieDomain = ".example.com";
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var test = function (name) {
                    Assert.equal(snippet[name], appInsights.context._config[name](), name + " is set and correct");
                };
                // verify
                test("instrumentationKey");
                test("accountId");
                test("sessionRenewalMs");
                test("sessionExpirationMs");
                test("cookieDomain");
                test("maxBatchSizeInBytes");
                test("maxBatchInterval");
                test("endpointUrl");
                test("emitLineDelimitedJson");
                test("maxBatchSizeInBytes");
                test("maxBatchInterval");
                test("disableTelemetry");
                test("enableSessionStorageBuffer");
                test("isRetryDisabled");
                test("isBeaconApiDisabled");
                Assert.equal(snippet.enableDebug, Microsoft.ApplicationInsights._InternalLogging.enableDebugExceptions(), "enableDebugExceptions is set and correct");
            }
        });
        this.testCase({
            name: "AppInsightsTests: disabled session storage and change the max payload size if Beacon API is enabled",
            test: function () {
                // setup
                var snippet = _this.getAppInsightsSnippet();
                snippet.isBeaconApiDisabled = false;
                snippet.enableSessionStorageBuffer = true;
                snippet.maxBatchSizeInBytes = 1000000;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                Assert.equal(false, appInsights.context._config.isBeaconApiDisabled(), "Beacon API enabled");
                Assert.equal(false, appInsights.context._config.enableSessionStorageBuffer(), "Session storage disabled");
                Assert.equal(65536, appInsights.context._config.maxBatchSizeInBytes(), "Max batch size overriden by Beacon API payload limitation");
            }
        });
        this.testCase({
            name: "AppInsights._onerror creates a dump of unexpected error thrown by trackException for logging",
            test: function () {
                var sut = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var dumpSpy = _this.sandbox.spy(Microsoft.ApplicationInsights.Util, "dump");
                var unexpectedError = new Error();
                var stub = _this.sandbox.stub(sut, "trackException").throws(unexpectedError);
                sut._onerror("any message", "any://url", 420, 42, new Error());
                Assert.ok(dumpSpy.calledWith(unexpectedError));
            }
        });
        this.testCase({
            name: "AppInsights._onerror stringifies error object",
            test: function () {
                var sut = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var dumpSpy = _this.sandbox.spy(Microsoft.ApplicationInsights.Util, "dump");
                var unexpectedError = new Error("my cool message");
                var stub = _this.sandbox.stub(sut, "trackException").throws(unexpectedError);
                sut._onerror("any message", "any://url", 420, 42, new Error());
                Assert.ok(dumpSpy.returnValues[0].indexOf("stack: ") != -1);
                Assert.ok(dumpSpy.returnValues[0].indexOf("message: 'my cool message'") != -1);
                Assert.ok(dumpSpy.returnValues[0].indexOf("name: 'Error'") != -1);
            }
        });
        this.testCase({
            name: "AppInsights._onerror logs name of unexpected error thrown by trackException for diagnostics",
            test: function () {
                var sut = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var throwInternal = _this.sandbox.spy(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                var nameStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getExceptionName");
                var stub = _this.sandbox.stub(sut, "trackException").throws(new Error());
                var expectedErrorName = "test error";
                nameStub.returns(expectedErrorName);
                sut._onerror("any message", "any://url", 420, 42, new Error());
                var logMessage = throwInternal.getCall(0).args[2];
                Assert.notEqual(-1, logMessage.indexOf(expectedErrorName));
            }
        });
        this.testCase({
            name: "AppInsights._onerror add document URL in case of CORS error",
            test: function () {
                // prepare
                var sut = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackSpy = _this.sandbox.spy(sut.context, "track");
                // act
                sut._onerror("Script error.", "", 0, 0, null);
                // assert
                Assert.equal(document.URL, trackSpy.args[0][0].data.baseData.properties.url);
            }
        });
        this.testCase({
            name: "AppInsights._onerror adds document URL in case of no CORS error",
            test: function () {
                // prepare
                var sut = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackExceptionSpy = _this.sandbox.spy(sut, "trackException");
                // act
                // Last arg is not an error\null which will be treated as not CORS issue
                sut._onerror("Script error.", "", 0, 0, new Object());
                // assert
                // properties are passed as a 3rd parameter
                Assert.equal(document.URL, trackExceptionSpy.args[0][2].url);
            }
        });
        this.addPageViewSignatureTests();
        this.addStartStopTests();
    };
    AppInsightsTests.prototype.addPageViewSignatureTests = function () {
        var _this = this;
        var testValues = {
            name: "name",
            url: "url",
            duration: 1000,
            properties: {
                "property1": 5,
                "property2": 10
            },
            measurements: {
                "measurement": 300
            }
        };
        var test = function (trackAction, validateAction) {
            // setup
            var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
            var stub = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewManager.prototype, "trackPageView");
            // act
            trackAction(appInsights);
            // verify
            Assert.ok(stub.called);
            var data = stub.args[0];
            validateAction(data);
        };
        this.testCase({
            name: name + "PageviewData is initialized in constructor with 0 parameters and valid",
            test: function () {
                var trackAction = function (ai) { return ai.trackPageView(); };
                var validateAction = function (data) {
                    Assert.notEqual(testValues.name, data[0]);
                    Assert.notEqual(testValues.url, data[1]);
                    Assert.notEqual(testValues.properties, data[2]);
                    Assert.notEqual(testValues.measurements, data[3]);
                };
                test(trackAction, validateAction);
            }
        });
        this.testCase({
            name: name + "PageviewData is initialized in constructor with name and valid",
            test: function () {
                var trackAction = function (ai) { return ai.trackPageView(testValues.name); };
                var validateAction = function (data) {
                    Assert.equal(testValues.name, data[0]);
                    Assert.notEqual(testValues.url, data[1]);
                    Assert.notEqual(testValues.properties, data[2]);
                    Assert.notEqual(testValues.measurements, data[3]);
                };
                test(trackAction, validateAction);
            }
        });
        this.testCase({
            name: name + "PageviewData is initialized in constructor with name and properties and valid",
            test: function () {
                var trackAction = function (ai) { return ai.trackPageView(testValues.name, null, testValues.properties); };
                var validateAction = function (data) {
                    Assert.equal(testValues.name, data[0]);
                    Assert.notEqual(testValues.url, data[1]);
                    Assert.deepEqual(testValues.properties, data[2]);
                    Assert.notEqual(testValues.measurements, data[3]);
                };
                test(trackAction, validateAction);
            }
        });
        this.testCase({
            name: name + "PageviewData is initialized in constructor with name and url and valid",
            test: function () {
                var trackAction = function (ai) { return ai.trackPageView(testValues.name, testValues.url); };
                var validateAction = function (data) {
                    Assert.equal(testValues.name, data[0]);
                    Assert.equal(testValues.url, data[1]);
                    Assert.notEqual(testValues.properties, data[2]);
                    Assert.notEqual(testValues.measurements, data[3]);
                };
                test(trackAction, validateAction);
            }
        });
        this.testCase({
            name: name + "PageviewData is initialized in constructor with name, properties, and measurements and valid",
            test: function () {
                var trackAction = function (ai) { return ai.trackPageView(testValues.name, null, testValues.properties, testValues.measurements); };
                var validateAction = function (data) {
                    Assert.equal(testValues.name, data[0]);
                    Assert.notEqual(testValues.url, data[1]);
                    Assert.deepEqual(testValues.properties, data[2]);
                    Assert.deepEqual(testValues.measurements, data[3]);
                };
                test(trackAction, validateAction);
            }
        });
        this.testCase({
            name: name + "PageviewData is initialized in constructor with name, url, and properties and valid",
            test: function () {
                var trackAction = function (ai) { return ai.trackPageView(testValues.name, testValues.url, testValues.properties); };
                var validateAction = function (data) {
                    Assert.equal(testValues.name, data[0]);
                    Assert.equal(testValues.url, data[1]);
                    Assert.deepEqual(testValues.properties, data[2]);
                    Assert.notEqual(testValues.measurements, data[3]);
                };
                test(trackAction, validateAction);
            }
        });
        this.testCase({
            name: name + "PageviewData is initialized in constructor with name, url, properties, and measurements and valid",
            test: function () {
                var trackAction = function (ai) { return ai.trackPageView(testValues.name, testValues.url, testValues.properties, testValues.measurements); };
                var validateAction = function (data) {
                    Assert.equal(testValues.name, data[0]);
                    Assert.equal(testValues.url, data[1]);
                    Assert.deepEqual(testValues.properties, data[2]);
                    Assert.deepEqual(testValues.measurements, data[3]);
                };
                test(trackAction, validateAction);
            }
        });
    };
    AppInsightsTests.prototype.addStartStopTests = function () {
        var _this = this;
        var testValues = {
            name: "name",
            url: "url",
            duration: 200,
            properties: {
                "property1": 5,
                "property2": 10
            },
            measurements: {
                "measurement": 300
            }
        };
        this.testCase({
            name: "Timing Tests: Start/StopPageView pass correct duration",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var spy = _this.sandbox.spy(appInsights, "sendPageViewInternal");
                // act
                appInsights.startTrackPage();
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage();
                // verify
                Assert.ok(spy.calledOnce, "stop track page view sent data");
                var actualDuration = spy.args[0][2];
                Assert.equal(testValues.duration, actualDuration, "duration is calculated and sent correctly");
            }
        });
        //Geo
        this.testCase({
            name: "Timing Tests: Stubbed Start/StopPageView pass correct duration sending StartDate to StartTrackPage",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var actualTime = new Date();
                _this.clock.tick(testValues.duration);
                var spy = _this.sandbox.spy(appInsights, "sendPageViewInternal");
                // act
                appInsights.startTrackPage(actualTime);
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage();
                // verify
                Assert.ok(spy.calledOnce, "stop track page view sent data");
                var actualDuration = spy.args[0][2];
                Assert.equal(testValues.duration * 2, actualDuration, "duration is calculated and sent correctly");
            }
        });
        this.testCase({
            name: "Timing Tests: Start/StopPageView tracks single page view with no parameters",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(10); // Needed to ensure the duration calculation works
                // act
                appInsights.startTrackPage();
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage();
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped");
                // verify
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.notEqual(testValues.name, telemetry.name);
                Assert.notEqual(testValues.url, telemetry.url);
                Assert.notEqual(testValues.properties, telemetry.properties);
                Assert.notEqual(testValues.measurements, telemetry.measurements);
            }
        });
        //Geo
        this.testCase({
            name: "Timing Tests: Stubbed Start/StopPageView pass correct duration sending endDate to StopTrackPage",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var startTime = new Date();
                _this.clock.tick(testValues.duration);
                var spy = _this.sandbox.spy(appInsights, "sendPageViewInternal");
                var stopTime = new Date();
                // act
                //Cambio
                appInsights.startTrackPage(startTime);
                appInsights.stopTrackPage(null, null, null, null, stopTime);
                // verify
                Assert.ok(spy.calledOnce, "stop track page view sent data");
                var actualDuration = spy.args[0][2];
                Assert.equal(testValues.duration, actualDuration, "duration is calculated and sent correctly");
            }
        });
        this.testCase({
            name: "Timing Tests: Start/StopPageView tracks single page view with no parameters",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(10); // Needed to ensure the duration calculation works
                // act
                appInsights.startTrackPage();
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage();
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped");
                // verify
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.notEqual(testValues.name, telemetry.name);
                Assert.notEqual(testValues.url, telemetry.url);
                Assert.notEqual(testValues.properties, telemetry.properties);
                Assert.notEqual(testValues.measurements, telemetry.measurements);
            }
        });
        this.testCase({
            name: "Timing Tests: Start/StopPageView tracks single page view with all parameters",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(10); // Needed to ensure the duration calculation works
                // act
                appInsights.startTrackPage(testValues.name);
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage(testValues.name, testValues.url, testValues.properties, testValues.measurements);
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped");
                // verify
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.equal(testValues.name, telemetry.name);
                Assert.equal(testValues.url, telemetry.url);
                Assert.deepEqual(testValues.properties, telemetry.properties);
                Assert.deepEqual(testValues.measurements, telemetry.measurements);
                // act
                trackStub.reset();
                appInsights.startTrackPage(testValues.name);
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage(testValues.name, testValues.url, testValues.properties, testValues.measurements);
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped");
                // verify
                telemetry = trackStub.args[0][0].data.baseData;
                Assert.equal(testValues.name, telemetry.name);
                Assert.equal(testValues.url, telemetry.url);
                Assert.deepEqual(testValues.properties, telemetry.properties);
                Assert.deepEqual(testValues.measurements, telemetry.measurements);
            }
        });
        this.testCase({
            name: "Timing Tests: Multiple Start/StopPageView track single pages view ",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(10); // Needed to ensure the duration calculation works
                // act
                appInsights.startTrackPage(testValues.name);
                _this.clock.tick(testValues.duration);
                appInsights.startTrackPage();
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage();
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped no parameters");
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackPage(testValues.name, testValues.url, testValues.properties, testValues.measurements);
                Assert.ok(trackStub.calledTwice, "single page view tracking stopped all parameters");
                // verify
                // Empty parameters
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.notEqual(testValues.name, telemetry.name);
                Assert.notEqual(testValues.url, telemetry.url);
                Assert.notEqual(testValues.properties, telemetry.properties);
                Assert.notEqual(testValues.measurements, telemetry.measurements);
                // All parameters
                telemetry = trackStub.args[1][0].data.baseData;
                Assert.equal(testValues.name, telemetry.name);
                Assert.equal(testValues.url, telemetry.url);
                Assert.deepEqual(testValues.properties, telemetry.properties);
                Assert.deepEqual(testValues.measurements, telemetry.measurements);
            }
        });
        this.testCase({
            name: "Timing Tests: Multiple startTrackPage",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var logStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                // act
                appInsights.startTrackPage();
                appInsights.startTrackPage();
                // verify
                Assert.ok(logStub.calledOnce, "calling start twice triggers warning to user");
            }
        });
        this.testCase({
            name: "Timing Tests: stopTrackPage called without a corresponding start",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var logStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                // act
                appInsights.stopTrackPage();
                // verify
                Assert.ok(logStub.calledOnce, "calling stop without a corresponding start triggers warning to user");
            }
        });
        this.testCase({
            name: "Timing Tests: Start/StopTrackEvent",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(10); // Needed to ensure the duration calculation works
                // act
                appInsights.startTrackEvent(testValues.name);
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackEvent(testValues.name, testValues.properties, testValues.measurements);
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped");
                // verify
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.equal(testValues.name, telemetry.name);
                Assert.deepEqual(testValues.properties, telemetry.properties);
                Assert.deepEqual(testValues.measurements, telemetry.measurements);
                // act
                trackStub.reset();
                appInsights.startTrackEvent(testValues.name);
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackEvent(testValues.name, testValues.properties, testValues.measurements);
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped");
                // verify
                telemetry = trackStub.args[0][0].data.baseData;
                Assert.equal(testValues.name, telemetry.name);
                Assert.deepEqual(testValues.properties, telemetry.properties);
                Assert.deepEqual(testValues.measurements, telemetry.measurements);
            }
        });
        this.testCase({
            name: "Timing Tests: Multiple Start/StopTrackEvent",
            test: function () {
                // setup
                var testValues2 = {
                    name: "test2",
                    duration: 500
                };
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(10); // Needed to ensure the duration calculation works
                // act
                appInsights.startTrackEvent(testValues.name);
                appInsights.startTrackEvent(testValues2.name);
                _this.clock.tick(testValues2.duration);
                appInsights.stopTrackEvent(testValues2.name);
                Assert.ok(trackStub.calledOnce, "single event tracking stopped for " + testValues2.name);
                _this.clock.tick(testValues.duration);
                appInsights.stopTrackEvent(testValues.name, testValues.properties, testValues.measurements);
                Assert.ok(trackStub.calledTwice, "single event tracking stopped for " + testValues.name);
                // verify
                // TestValues2
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.equal(testValues2.name, telemetry.name);
                // TestValues1
                telemetry = trackStub.args[1][0].data.baseData;
                Assert.equal(testValues.name, telemetry.name);
                Assert.deepEqual(testValues.properties, telemetry.properties);
                Assert.deepEqual(testValues.measurements, telemetry.measurements);
            }
        });
        this.testCase({
            name: "Timing Tests: Multiple startTrackEvent",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var logStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                // act
                appInsights.startTrackEvent("Event1");
                appInsights.startTrackEvent("Event1");
                // verify
                Assert.ok(logStub.calledOnce, "calling startTrackEvent twice triggers warning to user");
            }
        });
        this.testCase({
            name: "Timing Tests: stopTrackPage called without a corresponding start",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var logStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                // act
                appInsights.stopTrackPage("Event1");
                // verify
                Assert.ok(logStub.calledOnce, "calling stopTrackEvent without a corresponding start triggers warning to user");
            }
        });
        this.testCase({
            name: "Timing Tests: Start/StopTrackEvent has correct duration",
            test: function () {
                // setup
                var testValues1 = {
                    name: "test1",
                    duration: 300
                };
                var testValues2 = {
                    name: "test2",
                    duration: 200
                };
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(55); // Needed to ensure the duration calculation works
                // act
                appInsights.startTrackEvent(testValues1.name);
                _this.clock.tick(testValues1.duration);
                appInsights.stopTrackEvent(testValues1.name);
                appInsights.startTrackEvent(testValues2.name);
                _this.clock.tick(testValues2.duration);
                appInsights.stopTrackEvent(testValues2.name);
                // verify
                // TestValues1
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.equal(testValues1.name, telemetry.name);
                Assert.equal(testValues1.duration, telemetry.measurements["duration"]);
                // TestValues2
                telemetry = trackStub.args[1][0].data.baseData;
                Assert.equal(testValues2.name, telemetry.name);
                Assert.equal(testValues2.duration, telemetry.measurements["duration"]);
            }
        });
        this.testCase({
            name: "Timing Tests: Start/StopTrackEvent custom duration is not overriden",
            test: function () {
                // setup
                var testValues2 = {
                    name: "name2",
                    url: "url",
                    duration: 345,
                    properties: {
                        "property1": 5
                    },
                    measurements: {
                        "duration": 777
                    }
                };
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                _this.clock.tick(10);
                // act
                appInsights.startTrackEvent(testValues2.name);
                _this.clock.tick(testValues2.duration);
                appInsights.stopTrackEvent(testValues2.name, testValues2.properties, testValues2.measurements);
                Assert.ok(trackStub.calledOnce, "single page view tracking stopped");
                // verify
                var telemetry = trackStub.args[0][0].data.baseData;
                Assert.equal(testValues2.name, telemetry.name);
                Assert.deepEqual(testValues2.properties, telemetry.properties);
                Assert.deepEqual(testValues2.measurements, telemetry.measurements);
            }
        });
        this.testCase({
            name: "flush causes queue to be sent",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                appInsights.config.maxBatchInterval = 100;
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                appInsights.context._sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(appInsights.context._sender, "_sender");
                // act
                appInsights.trackEvent("Event1");
                appInsights.trackEvent("Event2");
                appInsights.trackEvent("Event3");
                // verify
                _this.clock.tick(1);
                Assert.ok(senderSpy.notCalled, "data is not sent without calling flush");
                // act
                appInsights.flush();
                // verify
                _this.clock.tick(1);
                Assert.ok(senderSpy.calledOnce, "data is sent after calling flush");
            }
        });
        this.testCase({
            name: "PageView should cause internal event throttle to be reset",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                appInsights.context._sender._sender = function () { return null; };
                var senderStub = _this.sandbox.stub(appInsights.context._sender, "_sender");
                var resetInternalMessageCountStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "resetInternalMessageCount");
                // setup a page view envelope
                var pageView = new Microsoft.ApplicationInsights.Telemetry.PageView();
                var pageViewData = new Microsoft.ApplicationInsights.Telemetry.Common.Data(Microsoft.ApplicationInsights.Telemetry.PageView.dataType, pageView);
                var pageViewEnvelope = new Microsoft.ApplicationInsights.Telemetry.Common.Envelope(pageViewData, Microsoft.ApplicationInsights.Telemetry.PageView.envelopeType);
                // act
                appInsights.context.track(pageViewEnvelope);
                // verify
                Assert.ok(resetInternalMessageCountStub.calledOnce, "Internal throttle was not reset even though Page View was tracked");
            }
        });
        this.testCase({
            name: "No other event than PageView should cause internal event throttle to be reset",
            test: function () {
                // setup
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                appInsights.context._sender._sender = function () { return null; };
                var senderStub = _this.sandbox.stub(appInsights.context._sender, "_sender");
                var resetInternalMessageCountStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "resetInternalMessageCount");
                // setup a some other envelope
                var event = new Microsoft.ApplicationInsights.Telemetry.Event('Test Event');
                var eventData = new Microsoft.ApplicationInsights.Telemetry.Common.Data(Microsoft.ApplicationInsights.Telemetry.Event.dataType, event);
                var eventEnvelope = new Microsoft.ApplicationInsights.Telemetry.Common.Envelope(eventData, Microsoft.ApplicationInsights.Telemetry.Event.envelopeType);
                // act
                appInsights.context.track(eventEnvelope);
                // verify
                Assert.ok(resetInternalMessageCountStub.notCalled, "Internal throttle was reset even though Page View was not tracked");
            }
        });
        this.testCase({
            name: "trackDependency passes ajax data correctly",
            test: function () {
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context, "track");
                var pathName = "/api/temp/ABCD";
                var url = "https://tempurl.net/api/temp/ABCD?param1=test&param2=test";
                var commandName = "GET " + url;
                var target = "tempurl.net";
                var duration = 123;
                var success = false;
                var resultCode = 404;
                var properties = { "property1": 5 };
                var measurements = { "duration": 777 };
                // Act
                appInsights.trackDependency("0", "GET", url, commandName, duration, success, resultCode, properties, measurements);
                // Assert
                Assert.ok(trackStub.called, "Track should be called");
                var rdd = trackStub.args[0][0].data.baseData;
                Assert.equal("GET " + pathName, rdd.name);
                Assert.equal(commandName, rdd.data);
                Assert.equal(target, rdd.target);
                Assert.equal("00:00:00.123", rdd.duration);
                Assert.equal(success, rdd.success);
                Assert.equal(resultCode, rdd.resultCode);
                Assert.deepEqual(properties, rdd.properties);
                Assert.deepEqual(measurements, rdd.measurements);
            }
        });
        this.testCase({
            name: "trackDependency includes instrumentation key into envelope name",
            test: function () {
                var iKey = "BDC8736D-D8E8-4B69-B19B-B0CE6B66A456";
                var iKeyNoDash = "BDC8736DD8E84B69B19BB0CE6B66A456";
                var snippet = _this.getAppInsightsSnippet();
                snippet.instrumentationKey = iKey;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.stub(appInsights.context._sender, "send");
                // verify
                var test = function (action, expectedEnvelopeType, expectedDataType) {
                    action();
                    var envelope = _this.getFirstResult(action, trackStub);
                    Assert.equal(iKey, envelope.iKey, "envelope iKey");
                    Assert.equal(expectedEnvelopeType.replace("{0}", iKeyNoDash), envelope.name, "envelope name");
                    Assert.equal(expectedDataType, envelope.data.baseType, "type name");
                    trackStub.reset();
                };
                // act
                test(function () { return appInsights.trackDependency("0", "GET", "http://asdf", "test", 123, true, 200); }, Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData.envelopeType, Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData.dataType);
            }
        });
        this.testCase({
            name: "trackDependency - by default no more than 20 ajaxes per view",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.stub(appInsights.context, "track");
                // Act
                for (var i = 0; i < 100; ++i) {
                    appInsights.trackDependency("0", "GET", "http://asdf", "test", 123, true, 200);
                }
                // Assert
                Assert.equal(20, trackStub.callCount, "Expected 20 invokations of trackAjax");
            }
        });
        this.testCase({
            name: "trackDependency - trackPageView resets counter of sent ajaxes",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.stub(appInsights.context, "track");
                // Act
                for (var i = 0; i < 100; ++i) {
                    appInsights.trackDependency("0", "POST", "http://asdf", "test", 123, true, 200);
                }
                appInsights.sendPageViewInternal("asdf", "http://microsoft.com", 123);
                trackStub.reset();
                for (var i = 0; i < 100; ++i) {
                    appInsights.trackDependency("0", "POST", "http://asdf", "test", 123, true, 200);
                }
                // Assert
                Assert.equal(20, trackStub.callCount, "Expected 20 invokations of trackAjax");
            }
        });
        this.testCase({
            name: "trackDependency - only 1 user actionable trace about ajaxes limit per view",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.stub(appInsights.context, "track");
                var loggingSpy = _this.sandbox.spy(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                // Act
                for (var i = 0; i < 20; ++i) {
                    appInsights.trackDependency("0", "POST", "http://asdf", "test", 123, true, 200);
                }
                loggingSpy.reset();
                for (var i = 0; i < 100; ++i) {
                    appInsights.trackDependency("0", "POST", "http://asdf", "test", 123, true, 200);
                }
                // Assert
                Assert.equal(1, loggingSpy.callCount, "Expected 1 invokation of internal logging");
            }
        });
        this.testCase({
            name: "trackDependency - '-1' means no ajax per view limit",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                snippet.maxAjaxCallsPerView = -1;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.stub(appInsights.context, "track");
                var ajaxCallsCount = 1000;
                // Act
                for (var i = 0; i < ajaxCallsCount; ++i) {
                    appInsights.trackDependency("0", "POST", "http://asdf", "test", 123, true, 200);
                }
                // Assert
                Assert.equal(ajaxCallsCount, trackStub.callCount, "Expected " + ajaxCallsCount + " invokations of trackAjax (no limit)");
            }
        });
        this.testCase({
            name: "trackAjax obsolete method is still supported",
            test: function () {
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(_this.getAppInsightsSnippet());
                var trackStub = _this.sandbox.stub(appInsights.context, "track");
                var pathName = "http://myurl.com/test";
                var url = "http://myurl.com/test";
                var target = "myurl.com";
                var duration = 123;
                var success = false;
                var resultCode = 404;
                // Act
                appInsights.trackAjax("0", url, pathName, duration, success, resultCode);
                // Assert
                Assert.ok(trackStub.called, "Track should be called");
                var rdd = trackStub.args[0][0].data.baseData;
                Assert.equal("/test", rdd.name);
                Assert.equal(url, rdd.data);
                Assert.equal(target, rdd.target);
                Assert.equal("00:00:00.123", rdd.duration);
                Assert.equal(success, rdd.success);
            }
        });
        this.testCase({
            name: "Ajax - root/parent id are set and passed correctly",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                snippet.disableAjaxTracking = false;
                snippet.disableCorrelationHeaders = false;
                snippet.maxBatchInterval = 0;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.spy(appInsights, "trackDependency");
                var expectedRootId = appInsights.context.operation.id;
                Assert.ok(expectedRootId.length > 0, "root id was initialized to non empty string");
                // Act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/bla");
                xhr.send();
                var expectedAjaxId = xhr.ajaxData.id;
                Assert.ok(expectedAjaxId.length > 0, "ajax id was initialized");
                // Emulate response                               
                xhr.respond("200", {}, "");
                // Assert
                Assert.equal(expectedRootId, xhr.requestHeaders['x-ms-request-root-id'], "x-ms-request-root-id id set correctly");
                Assert.equal(expectedAjaxId, xhr.requestHeaders['x-ms-request-id'], "x-ms-request-id id set correctly");
                Assert.equal(expectedAjaxId, trackStub.args[0][0], "ajax id passed to trackAjax correctly");
            }
        });
        this.testCase({
            name: "Ajax - root/parent id are set only for dependency calls within the same domain",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                snippet.disableAjaxTracking = false;
                snippet.disableCorrelationHeaders = false;
                snippet.maxBatchInterval = 0;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.spy(appInsights, "trackDependency");
                var expectedRootId = appInsights.context.operation.id;
                Assert.ok(expectedRootId.length > 0, "root id was initialized to non empty string");
                // override currentWindowHost
                var sampleHost = "api.applicationinsights.io";
                appInsights._ajaxMonitor.currentWindowHost = sampleHost;
                // Act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "https://" + sampleHost + ":888/test");
                xhr.send();
                var expectedAjaxId = xhr.ajaxData.id;
                Assert.ok(expectedAjaxId.length > 0, "ajax id was initialized");
                // Emulate response                               
                xhr.respond("200", {}, "");
                // Assert
                Assert.equal(expectedRootId, xhr.requestHeaders['x-ms-request-root-id'], "x-ms-request-root-id id set correctly");
                Assert.equal(expectedAjaxId, xhr.requestHeaders['x-ms-request-id'], "x-ms-request-id id set correctly");
                Assert.equal(expectedAjaxId, trackStub.args[0][0], "ajax id passed to trackAjax correctly");
            }
        });
        this.testCase({
            name: "Ajax - disableCorrelationHeaders disables x-ms-request-id headers",
            test: function () {
                var snippet = _this.getAppInsightsSnippet();
                snippet.disableAjaxTracking = false;
                snippet.disableCorrelationHeaders = true;
                snippet.maxBatchInterval = 0;
                var appInsights = new Microsoft.ApplicationInsights.AppInsights(snippet);
                var trackStub = _this.sandbox.spy(appInsights, "trackDependency");
                var expectedRootId = appInsights.context.operation.id;
                Assert.ok(expectedRootId.length > 0, "root id was initialized to non empty string");
                // Act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/bla");
                xhr.send();
                // Emulate response                               
                xhr.respond("200", {}, "");
                // Assert
                Assert.equal(null, xhr.requestHeaders['x-ms-request-id'], "x-ms-request-id should not be set");
                Assert.equal(null, xhr.requestHeaders['x-ms-request-root-id'], "x-ms-request-root-id should not be set");
            }
        });
    };
    AppInsightsTests.prototype.getFirstResult = function (action, trackStub, skipSessionState) {
        var index;
        if (skipSessionState) {
            index = 1;
        }
        else {
            index = 0;
        }
        Assert.ok(trackStub.args && trackStub.args[index] && trackStub.args[index], "track was called for: " + action);
        return trackStub.args[index][0];
    };
    return AppInsightsTests;
}(TestClass));
new AppInsightsTests().registerTests();
/// <reference path="../../../JavaScriptSDK/appInsights.ts" />
/// <reference path="../../../JavaScriptSDK/util.ts" />
/// <reference path="../../../JavaScriptSDK/HashCodeScoreGenerator.ts" />
/// <reference path="../../testframework/common.ts" />
var HashCodeScoreGeneratorTests = (function (_super) {
    __extends(HashCodeScoreGeneratorTests, _super);
    function HashCodeScoreGeneratorTests() {
        _super.apply(this, arguments);
    }
    /** Method called before the start of each test method */
    HashCodeScoreGeneratorTests.prototype.testInitialize = function () {
        this.results = [];
    };
    /** Method called after each test method has completed */
    HashCodeScoreGeneratorTests.prototype.testCleanup = function () {
        this.results = [];
    };
    HashCodeScoreGeneratorTests.prototype.registerTests = function () {
        var contextKeys = new AI.ContextTagKeys();
        this.testCase({
            name: "HashCodeGeneratorTests: results consistent with .net implementation",
            test: function () {
                // test array is produced by .net sdk test
                var testArray = [
                    ["ss", 1179811869],
                    ["kxi", 34202699],
                    ["wr", 1281077591],
                    ["ynehgfhyuiltaiqovbpyhpm", 2139623659],
                    ["iaxxtklcw", 1941943012],
                    ["hjwvqjiiwhoxrtsjma", 1824011880],
                    ["rpiauyg", 251412007],
                    ["jekvjvh", 9189387],
                    ["hq", 1807146729],
                    ["kgqxrftjhefkwlufcxibwjcy", 270215819],
                    ["lkfc", 1228617029],
                    ["skrnpybqqu", 223230949],
                    ["px", 70671963],
                    ["dtn", 904623389],
                    ["nqfcxobaequ", 397313566],
                    ["togxlt", 948170633],
                    ["jvvdkhnahkaujxarkd", 1486894898],
                    ["mcloukvkamiaqja", 56804453],
                    ["ornuu", 1588005865],
                    ["otodvlhtvu", 1544494884],
                    ["uhpwhasnvmnykjkitla", 981289895],
                    ["itbnryqnjcgpmgivlghqtg", 1923061690],
                    ["wauetkdnivwlafbfhiedsfx", 2114415420],
                    ["fniwmeidbvd", 508699380],
                    ["vuwdgoxspstvj", 1821547235],
                    ["y", 1406544563],
                    ["pceqcixfb", 1282453766],
                    ["aentke", 255756533],
                    ["ni", 1696510239],
                    ["lbwehevltlnl", 1466602040],
                    ["ymxql", 1974582171],
                    ["mvqbaosfuip", 1560556398],
                    ["urmwofajwmmlornynglm", 701710403],
                    ["buptyvonyacerrt", 1315240646],
                    ["cxsqcnyieliatqnwc", 76148095],
                    ["svvco", 1849105799],
                    ["luwmjhwyt", 553630912],
                    ["lisvmmug", 822987687],
                    ["mmntilfbmxwuyij", 882214597],
                    ["hqmyv", 1510970959],
                ];
                var sut = new Microsoft.ApplicationInsights.HashCodeScoreGenerator();
                for (var i = 0; i < testArray.length; ++i) {
                    var res = sut.getHashCode(testArray[i][0]);
                    Assert.equal(testArray[i][1], res);
                }
            }
        });
    };
    return HashCodeScoreGeneratorTests;
}(TestClass));
new HashCodeScoreGeneratorTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/util.ts" />
var UtilTests = (function (_super) {
    __extends(UtilTests, _super);
    function UtilTests() {
        _super.apply(this, arguments);
    }
    UtilTests.prototype.testCleanup = function () {
        // reset storage cache
        Microsoft.ApplicationInsights.Util._canUseLocalStorage = undefined;
        Microsoft.ApplicationInsights.Util._canUseSessionStorage = undefined;
    };
    UtilTests.prototype.registerTests = function () {
        var _this = this;
        var Util = Microsoft.ApplicationInsights.Util;
        this.testCase({
            name: "UtilTests: getStorage with available storage",
            test: function () {
                var storage = _this.getMockStorage();
                var getStorageObjectStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "_getLocalStorageObject", function () { return storage; });
                storage["test"] = "A";
                Assert.equal("A", Util.getStorage("test"), "getStorage should return value of getItem for known keys");
                Assert.equal(undefined, Util.getStorage("another"), "getStorage should return value of getItem for unknown keys");
            }
        });
        this.testCase({
            name: "UtilTests: getStorage with no storage support",
            test: function () {
                var storage = undefined;
                var getStorageObjectStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "_getLocalStorageObject", function () { return storage; });
                Assert.equal(null, Util.getStorage("test"), "getStorage should return null when storage is unavailable");
            }
        });
        this.testCase({
            name: "UtilTests: can disable local and session storage",
            test: function () {
                // can use local and session storage by default
                Assert.ok(Util.canUseLocalStorage(), "can use local storage by default");
                Assert.ok(Util.canUseSessionStorage(), "can use session storage by default");
                Util.setStorage("key1", "value1");
                Util.setSessionStorage("key2", "value2");
                Assert.equal("value1", Util.getStorage("key1"), "can rad from local storage with it is enabled");
                Assert.equal("value2", Util.getSessionStorage("key2"), "can rad from session storage with it is enabled");
                // disable storages
                Util.disableStorage();
                // can't read 
                Assert.ok(!Util.canUseLocalStorage(), "can use local storage after it was disabled");
                Assert.ok(!Util.canUseSessionStorage(), "can use session storage after it was disabled");
                Assert.equal(null, Util.getStorage("key1"), "can't read from local storage when disabled");
                Assert.equal(null, Util.getSessionStorage("key2"), "can't read from session storage when disabled");
            }
        });
        this.testCase({
            name: "UtilTests: setStorage with available storage",
            test: function () {
                var storage = _this.getMockStorage();
                var getStorageObjectStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "_getLocalStorageObject", function () { return storage; });
                Assert.ok(Util.setStorage("test", "A"), "setStorage should return true if storage is available for writes");
            }
        });
        this.testCase({
            name: "UtilTests: setStorage with no storage support",
            test: function () {
                var storage = undefined;
                var getStorageObjectStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "_getLocalStorageObject", function () { return storage; });
                Assert.ok(!Util.setStorage("test", "A"), "setStorage should return false if storage is unavailable for writes");
            }
        });
        this.testCase({
            name: "UtilTests: removeStorage with available storage",
            test: function () {
                var storage = _this.getMockStorage();
                var getStorageObjectStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "_getLocalStorageObject", function () { return storage; });
                storage["test"] = "A";
                Assert.ok(Util.removeStorage("test"), "removeStorage should return true if storage is available for writes");
                Assert.deepEqual(undefined, storage["test"], "removeStorage should remove items from storage");
            }
        });
        this.testCase({
            name: "UtilTests: removeStorage with no storage support",
            test: function () {
                var storage = undefined;
                var getStorageObjectStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "_getLocalStorageObject", function () { return storage; });
                Assert.ok(!Util.removeStorage("test"), "removeStorage should return false if storage is unavailable for writes");
            }
        });
        this.testCase({
            name: "UtilTests: isArray",
            test: function () {
                var isArray = Util["isArray"];
                Assert.ok(isArray([]));
                Assert.ok(!isArray("sdf"));
                Assert.ok(isArray([0, 1]));
                Assert.ok(!isArray({ length: "" }));
                Assert.ok(!isArray({ length: 10 }));
                // arr instanceof Array; // false for this case
                var iframe = document.createElement('iframe');
                iframe.style.cssText = 'display:none;';
                document.body.appendChild(iframe);
                var iframeArray = window.frames[window.frames.length - 1]["Array"];
                if (typeof iframeArray === "function") {
                    var arr = new iframeArray(1, 2, 3); // [1,2,3]
                    Assert.ok(!(arr instanceof Array), "instanceof doesn't work here");
                    Assert.ok(isArray(arr));
                }
            }
        });
        this.testCase({
            name: "UtilTests: cookies",
            test: function () {
                // mock cookies
                (function (document) {
                    var cookies = {};
                    document.__defineGetter__('cookie', function () {
                        var output = [];
                        for (var cookieName in cookies) {
                            output.push(cookieName + "=" + cookies[cookieName]);
                        }
                        return output.join(";");
                    });
                    document.__defineSetter__('cookie', function (s) {
                        var indexOfSeparator = s.indexOf("=");
                        var key = s.substr(0, indexOfSeparator);
                        var value = s.substring(indexOfSeparator + 1);
                        cookies[key] = value;
                        return key + "=" + value;
                    });
                    document.clearCookies = function () {
                        cookies = {};
                    };
                })(document);
                var expectedValue = "testValue";
                Util.setCookie("test", expectedValue);
                var ua = navigator.userAgent.toLowerCase();
                var isSafari = ua.indexOf('safari') > -1 && ua.indexOf('chrome') < 0;
                if (isSafari) {
                    Assert.ok("Safari doesn't allow mocking cookies");
                }
                else {
                    var actualValue = Util.getCookie("test");
                    Assert.equal(expectedValue, actualValue, "cookie content was set and retrieved");
                    actualValue = Util.getCookie("");
                    Assert.equal("", actualValue, "cookie content was set and retrieved");
                }
            }
        });
        this.testCase({
            name: "UtilTests: can disable cookies",
            test: function () {
                Assert.ok(Util.canUseCookies(), "can use cookies by default");
                Util.disableCookies();
                Assert.ok(!Util.canUseCookies(), "cannot use cookies after they were disabled");
                // reset
                Util._canUseCookies = undefined;
            }
        });
        this.testCase({
            name: "UtilTests: parse cookie",
            test: function () {
                try {
                    var test = function (cookie, query, expected) {
                        Util["document"] = {
                            cookie: cookie
                        };
                        var actual = Util.getCookie(query);
                        Assert.deepEqual(expected, actual, "cookie is parsed correctly");
                    };
                    test("testCookie=id|acq|renewal", "testCookie", "id|acq|renewal");
                    test("other=something; testCookie=id|acq|renewal", "testCookie", "id|acq|renewal");
                    test("another=bar; ;a=testCookie=; testCookie=id|acq|renewal; other=something|3|testCookie=", "testCookie", "id|acq|renewal");
                    test("xtestCookiex=id|acq|renewal", "testCookie", "");
                    test("", "testCookie", "");
                }
                finally {
                    Util["document"] = document;
                }
            }
        });
        this.testCase({
            name: "UtilTests: canUseCookies returns false if document.cookie is not available",
            test: function () {
                var oldDocument = Util["document"];
                Util._canUseCookies = undefined;
                Util["document"] = {
                    cookie: undefined
                };
                Assert.equal(false, Util.canUseCookies(), "cookie are not available");
                // restore document object
                Util["document"] = oldDocument;
                Util._canUseCookies = undefined;
            }
        });
        this.testCase({
            name: "UtilTests: cannot set/get/delete cookies if document.cookie is not available",
            test: function () {
                var oldDocument = Util["document"];
                Util._canUseCookies = undefined;
                Util["document"] = {
                    cookie: undefined
                };
                var name = "test";
                Util.setCookie(name, "value");
                Assert.equal(undefined, Util.getCookie(name), "cookies are not supported");
                Util.deleteCookie(name);
                Assert.equal(undefined, Util.getCookie(name), "cookies are not supported");
                // restore document object
                Util["document"] = oldDocument;
                Util._canUseCookies = undefined;
            }
        });
        this.testCase({
            name: "UtilTests: new GUID",
            test: function () {
                var results = [];
                for (var i = 0; i < 100; i++) {
                    var newId = Util.newId();
                    for (var j = 0; j < results.length; j++) {
                        Assert.notEqual(newId, results[j]);
                    }
                    results.push(newId);
                }
            }
        });
        this.testCase({
            name: "UtilTests: toISO string for IE8",
            test: function () {
                var test = function () {
                    var date = new Date();
                    var output = Util.toISOStringForIE8(date);
                    var regex = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z");
                    Assert.ok(regex.test(output), "expected format was emitted");
                    try {
                        var expected = new Date().toISOString();
                        Assert.equal(expected, output, "format matches default in non-IE8");
                    }
                    catch (e) {
                        Assert.ok(true, "IE8");
                    }
                };
                test();
                var toISOString = Date.prototype.toISOString;
                Date.prototype.toISOString = undefined;
                test();
                Date.prototype.toISOString = toISOString;
            }
        });
        this.testCase({
            name: "UtilTests: msToTimeSpan",
            test: function () {
                var test = function (input, expected, message) {
                    var actual = Util.msToTimeSpan(input);
                    Assert.equal(expected, actual, message);
                };
                test(0, "00:00:00.000", "zero");
                test(1, "00:00:00.001", "milliseconds digit 1");
                test(8.7, "00:00:00.009", "milliseconds digit 1 with high precision");
                test(10, "00:00:00.010", "milliseconds digit 2");
                test(99.99, "00:00:00.100", "milliseconds digit 2 with high precision");
                test(100, "00:00:00.100", "milliseconds digit 3");
                test(456.123, "00:00:00.456", "milliseconds digit 3 with high precision");
                test(999.6789, "00:00:01.000", "milliseconds digit 3 with high precision, rounded to full a second");
                test(1 * 1000, "00:00:01.000", "seconds digit 1");
                test(10 * 1000, "00:00:10.000", "seconds digit 2");
                test(1 * 60 * 1000, "00:01:00.000", "minutes digit 1");
                test(10 * 60 * 1000, "00:10:00.000", "minutes digit 2");
                test(1 * 60 * 60 * 1000, "01:00:00.000", "hours digit 1");
                test(10 * 60 * 60 * 1000, "10:00:00.000", "hours digit 2");
                test(24 * 60 * 60 * 1000, "1.00:00:00.000", "a full day");
                test(10 * 24 * 60 * 60 * 1000 + 123.444, "10.00:00:00.123", "ten days and 123ms");
                test(11 * 3600000 + 11 * 60000 + 11111, "11:11:11.111", "all digits");
                test(11 * 3600000 + 11 * 60000 + 11111 + 0.33333, "11:11:11.111", "all digits with high precision");
                test(7 * 3600000 + 59 * 60000 + 59999 + 0.999, "08:00:00.000", "all digits with high precision, rounded to a full hour");
                test(23 * 3600000 + 59 * 60000 + 59999 + 0.556, "1.00:00:00.000", "all digits with high precision, rounded to a full day");
                test("", "00:00:00.000", "invalid input");
                test("'", "00:00:00.000", "invalid input");
                test(NaN, "00:00:00.000", "invalid input");
                test({}, "00:00:00.000", "invalid input");
                test([], "00:00:00.000", "invalid input");
                test(-1, "00:00:00.000", "invalid input");
            }
        });
        this.testCase({
            name: "Tests stringToBoolOrDefault() returns true only for 'true' string (ignoring case)",
            test: function () {
                Assert.ok(Util.stringToBoolOrDefault(undefined) === false);
                Assert.ok(Util.stringToBoolOrDefault(null) === false);
                Assert.ok(Util.stringToBoolOrDefault("") === false);
                Assert.ok(Util.stringToBoolOrDefault("asdf") === false);
                Assert.ok(Util.stringToBoolOrDefault(0) === false);
                Assert.ok(Util.stringToBoolOrDefault({ asfd: "sdf" }) === false);
                Assert.ok(Util.stringToBoolOrDefault(new Object()) === false);
                Assert.ok(Util.stringToBoolOrDefault("true") === true);
                Assert.ok(Util.stringToBoolOrDefault("TrUe") === true);
            }
        });
        this.testCase({
            name: "UtilTests: isCrossOriginError",
            test: function () {
                Assert.ok(Util.isCrossOriginError("Script error.", "", 0, 0, null) === true);
                Assert.ok(Util.isCrossOriginError("Script error.", "http://microsoft.com", 0, 0, null)
                    === true);
            }
        });
        this.testCase({
            name: "Util.dump returns string that includes information about object type",
            test: function () {
                var object = new Error();
                var result = Util.dump(object);
                var toStringRepresentation = Object.prototype.toString.call(object);
                Assert.notEqual(-1, result.indexOf(toStringRepresentation));
            }
        });
        this.testCase({
            name: "Util.dump returns string that includes information about object property values",
            test: function () {
                var object = { "property": "value" };
                var result = Util.dump(object);
                var jsonRepresentation = JSON.stringify(object);
                Assert.notEqual(-1, result.indexOf(jsonRepresentation));
            }
        });
        this.testCase({
            name: "Util.addEventHandler should attach the callback for the given event name",
            test: function () {
                // Assemble
                var eventName = 'goat';
                var customEvent = document.createEvent('Event');
                customEvent.initEvent(eventName, true, true);
                var isCallbackExecuted = false;
                var callback = function (e) {
                    isCallbackExecuted = true;
                };
                // Act
                var returnValue = Util.addEventHandler(eventName, callback);
                document.dispatchEvent(customEvent);
                // Assert
                Assert.ok(returnValue, 'Event handler was not attached.');
                Assert.ok(isCallbackExecuted, 'Callback was not executed');
            }
        });
        this.testCase({
            name: "Util.addEventHandler should handle illegal event name",
            test: function () {
                // Assemble
                var eventName = undefined;
                var customEvent = document.createEvent('Event');
                customEvent.initEvent(eventName, true, true);
                var isCallbackExecuted = false;
                var callback = function (e) {
                    isCallbackExecuted = true;
                };
                // Act
                var returnValue = Util.addEventHandler(eventName, callback);
                document.dispatchEvent(customEvent);
                // Assert
                Assert.equal(false, returnValue, 'Event handler was attached for illegal event name');
                Assert.equal(false, isCallbackExecuted, 'Callback was executed when it was not supposed to.');
            }
        });
        this.testCase({
            name: "Util.addEventHandler should handle illegal callback",
            test: function () {
                // Assemble
                var eventName = 'goat';
                var customEvent = document.createEvent('Event');
                customEvent.initEvent(eventName, true, true);
                var isCallbackExecuted = false;
                var callback = undefined;
                // Act
                var returnValue = Util.addEventHandler(eventName, callback);
                document.dispatchEvent(customEvent);
                // Assert
                Assert.equal(false, returnValue, 'Event handler was attached for illegal callback');
            }
        });
        this.testCase({
            name: "getIE function should return null for non-IE user agent string and IE version for IE",
            test: function () {
                // Assert
                Assert.equal(null, Util.getIEVersion("Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36"), "Should return null for non-IE");
                Assert.equal(8, Util.getIEVersion("Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 10.0; Win64; x64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729"), "Should return IE version for IE browser");
            }
        });
    };
    UtilTests.prototype.getMockStorage = function () {
        var storage = {};
        storage.getItem = function (name) { return storage[name]; };
        storage.setItem = function (name, value) { return (storage[name] = value); };
        storage.removeItem = function (name, value) { return (storage[name] = undefined); };
        return storage;
    };
    return UtilTests;
}(TestClass));
new UtilTests().registerTests();
/// <reference path="../../../JavaScriptSDK/appInsights.ts" />
/// <reference path="../../../JavaScriptSDK/context/sample.ts" />
/// <reference path="../../testframework/common.ts" />
/// <reference path="../Util.tests.ts"/>
var SampleContextTests = (function (_super) {
    __extends(SampleContextTests, _super);
    function SampleContextTests() {
        _super.apply(this, arguments);
    }
    /** Method called before the start of each test method */
    SampleContextTests.prototype.testInitialize = function () {
        this.results = [];
    };
    /** Method called after each test method has completed */
    SampleContextTests.prototype.testCleanup = function () {
        this.results = [];
    };
    SampleContextTests.prototype.registerTests = function () {
        var _this = this;
        var contextKeys = new AI.ContextTagKeys();
        this.testCase({
            name: "Sampling: isSampledIn returns true for 100 sampling rate",
            test: function () {
                // setup
                var sample = new Microsoft.ApplicationInsights.Context.Sample(100);
                var envelope = _this.getEnvelope();
                envelope.tags[contextKeys.userId] = null;
                envelope.tags[contextKeys.operationId] = null;
                // act
                var isSampledIn = sample.isSampledIn(envelope);
                // assert
                Assert.ok(isSampledIn);
            }
        });
        this.testCase({
            name: "Sampling: hashing is based on user id even if operation id is provided",
            test: function () {
                // setup
                var sample = new Microsoft.ApplicationInsights.Context.Sample(33);
                var userid = "asdf";
                var envelope1 = _this.getEnvelope();
                envelope1.tags[contextKeys.userId] = userid;
                envelope1.tags[contextKeys.operationId] = "operation 1";
                var envelope2 = _this.getEnvelope();
                envelope2.tags[contextKeys.userId] = userid;
                envelope2.tags[contextKeys.operationId] = "operation 2";
                // act
                var isSampledIn1 = sample.isSampledIn(envelope1);
                var isSampledIn2 = sample.isSampledIn(envelope2);
                // assert
                Assert.equal(isSampledIn1, isSampledIn2);
            }
        });
        this.testCase({
            name: "Sampling: hashing is based on operation id if no user id is provided",
            test: function () {
                // setup
                var sample = new Microsoft.ApplicationInsights.Context.Sample(33);
                var operationid = "operation id";
                var envelope1 = _this.getEnvelope();
                envelope1.tags[contextKeys.userId] = null;
                envelope1.tags[contextKeys.operationId] = operationid;
                var envelope2 = _this.getEnvelope();
                envelope2.tags[contextKeys.userId] = null;
                envelope2.tags[contextKeys.operationId] = operationid;
                var envelope3 = _this.getEnvelope();
                envelope3.tags[contextKeys.userId] = undefined;
                envelope3.tags[contextKeys.operationId] = operationid;
                var envelope4 = _this.getEnvelope();
                envelope4.tags[contextKeys.userId] = "";
                envelope4.tags[contextKeys.operationId] = operationid;
                // act
                var isSampledIn1 = sample.isSampledIn(envelope1);
                var isSampledIn2 = sample.isSampledIn(envelope2);
                var isSampledIn3 = sample.isSampledIn(envelope3);
                var isSampledIn4 = sample.isSampledIn(envelope4);
                // assert
                Assert.equal(isSampledIn1, isSampledIn2);
                Assert.equal(isSampledIn1, isSampledIn3);
                Assert.equal(isSampledIn1, isSampledIn4);
            }
        });
        this.testCase({
            name: "Sampling: hashing is random if no user id nor operation id provided",
            test: function () {
                // setup
                var sample = new Microsoft.ApplicationInsights.Context.Sample(33);
                var envelope1 = _this.getEnvelope();
                envelope1.tags[contextKeys.userId] = null;
                envelope1.tags[contextKeys.operationId] = null;
                var mathRandomSpy = _this.sandbox.spy(Math, "random");
                // act
                sample.isSampledIn(envelope1);
                // assert
                Assert.ok(mathRandomSpy.calledOnce);
            }
        });
        this.testCase({
            name: "Sampling: actual sampling rate should fall into 5% error range",
            test: function () {
                // setup
                var errorRange = 5;
                var totalItems = 1000;
                var ids = [];
                for (var i = 0; i < totalItems; ++i) {
                    ids.push(Microsoft.ApplicationInsights.Util.newId());
                }
                var sampleRates = [50, 33, 25, 20, 16, 10];
                // act
                sampleRates.forEach(function (sampleRate) {
                    var sut = new Microsoft.ApplicationInsights.HashCodeScoreGenerator();
                    var countOfSampledItems = 0;
                    ids.forEach(function (id) {
                        if (sut.getHashCodeScore(id) < sampleRate)
                            ++countOfSampledItems;
                    });
                    // Assert
                    var actualSampleRate = 100 * countOfSampledItems / totalItems;
                    Assert.ok(Math.abs(actualSampleRate - sampleRate) < errorRange, "Actual sampling (" + actualSampleRate + ") does not fall into +-2% range from expected rate (" + sampleRate + ")");
                });
            }
        });
    };
    SampleContextTests.prototype.getEnvelope = function () {
        var pageView = new Microsoft.ApplicationInsights.Telemetry.PageView();
        var data = new Microsoft.ApplicationInsights.Telemetry.Common.Data(Microsoft.ApplicationInsights.Telemetry.PageView.dataType, pageView);
        return new Microsoft.ApplicationInsights.Telemetry.Common.Envelope(data, Microsoft.ApplicationInsights.Telemetry.PageView.envelopeType);
    };
    return SampleContextTests;
}(TestClass));
new SampleContextTests().registerTests();
/// <reference path="../../../JavaScriptSDK/context/user.ts" />
/// <reference path="../../testframework/common.ts" />
/// <reference path="../Util.tests.ts"/>
var UserContextTests = (function (_super) {
    __extends(UserContextTests, _super);
    function UserContextTests() {
        _super.call(this, "UserContext");
    }
    /** Method called before the start of each test method */
    UserContextTests.prototype.testInitialize = function () {
    };
    /** Method called after each test method has completed */
    UserContextTests.prototype.testCleanup = function () {
    };
    UserContextTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "Types: user context initializes from cookie when possible",
            test: function () {
                // setup
                var id = "userId";
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return id + "||||"; });
                // act
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // verify
                Assert.equal(id, user.id, "user id was set from cookie");
            }
        });
        this.testCase({
            name: "ai_user cookie is set with acq date and year expiration",
            test: function () {
                // setup
                var id = "userId";
                var actualCookieName;
                var actualCookieValue;
                var newIdStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "newId", function () { return "newId"; });
                var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return ""; });
                var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (cookieName, cookieValue) {
                    actualCookieName = cookieName;
                    actualCookieValue = cookieValue;
                });
                // act
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // verify
                Assert.equal("ai_user", actualCookieName, "ai_user cookie is set");
                var cookieValueParts = actualCookieValue.split(';');
                Assert.equal(2, cookieValueParts.length, "ai_user cookie value should have actual value and expiration");
                Assert.equal(2, cookieValueParts[0].split('|').length, "ai_user cookie value before expiration should include user id and acq date");
                Assert.equal("newId", cookieValueParts[0].split('|')[0], "First part of ai_user cookie value should be new user id guid");
                Assert.equal(new Date().toString(), (new Date(cookieValueParts[0].split('|')[1])).toString(), "Second part of ai_user cookie should be parsable as date");
                var expiration = cookieValueParts[1];
                Assert.equal(true, expiration.substr(0, "expires=".length) === "expires=", "ai_user cookie expiration part should start with expires=");
                var expirationDate = new Date(expiration.substr("expires=".length));
                Assert.equal(true, expirationDate > (new Date), "ai_user cookie expiration should be in the future");
                // cleanup
            }
        });
        this.testCase({
            name: "ai_user cookie is set with acq date and year expiration",
            test: function () {
                // setup
                var id = "userId";
                var actualCookieName;
                var actualCookieValue;
                var newIdStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "newId", function () { return "newId"; });
                var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return ""; });
                var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (cookieName, cookieValue) {
                    actualCookieName = cookieName;
                    actualCookieValue = cookieValue;
                });
                // act
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // verify
                Assert.equal("ai_user", actualCookieName, "ai_user cookie is set");
                var cookieValueParts = actualCookieValue.split(';');
                Assert.equal(2, cookieValueParts.length, "ai_user cookie value should have actual value and expiration");
                Assert.equal(2, cookieValueParts[0].split('|').length, "ai_user cookie value before expiration should include user id and acq date");
                Assert.equal("newId", cookieValueParts[0].split('|')[0], "First part of ai_user cookie value should be new user id guid");
                Assert.equal(new Date().toString(), (new Date(cookieValueParts[0].split('|')[1])).toString(), "Second part of ai_user cookie should be parsable as date");
                var expiration = cookieValueParts[1];
                Assert.equal(true, expiration.substr(0, "expires=".length) === "expires=", "ai_user cookie expiration part should start with expires=");
                var expirationDate = new Date(expiration.substr("expires=".length));
                Assert.equal(true, expirationDate > (new Date), "ai_user cookie expiration should be in the future");
                // cleanup
            }
        });
        this.testCase({
            name: "Ctor: auth and account id initialize from cookie",
            test: function () {
                // setup
                var authId = "bla@bla.com";
                var accountId = "Contoso";
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return authId + "|" + accountId; });
                // act
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // verify
                Assert.equal(authId, user.authenticatedId, "user auth id was set from cookie");
                Assert.equal(accountId, user.accountId, "user account id was not set from cookie");
            }
        });
        this.testCase({
            name: "Ctor: auth id initializes from cookie (without account id)",
            test: function () {
                // setup
                var authId = "bla@bla.com";
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return authId; });
                // act
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // verify
                Assert.equal(authId, user.authenticatedId, "user auth id was set from cookie");
            }
        });
        this.testCase({
            name: "Ctor: auth user context handles empty cookie",
            test: function () {
                // setup
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return ""; });
                // act
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was not set");
                Assert.equal(undefined, user.accountId, "user account id was not set");
            }
        });
        this.testCase({
            name: "Ctor: auth user context handles empty cookie with accountId backward compatibility",
            test: function () {
                // setup
                var config = _this.getEmptyConfig();
                config.accountId = function () { return "account17"; };
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return null; });
                // act
                var user = new Microsoft.ApplicationInsights.Context.User(config);
                // verify
                Assert.equal(config.accountId(), user.accountId, "user account id was set from back compat");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: auth user set in cookie without account id",
            test: function () {
                // setup
                var authAndAccountId = ["bla@bla.com"];
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // act
                user.setAuthenticatedUserContext(authAndAccountId[0]);
                // verify
                Assert.equal(authAndAccountId[0], user.authenticatedId, "user auth id was set");
                Assert.equal(cookieStub.calledWithExactly('ai_authUser', encodeURI(authAndAccountId.join('|')), null), true, "user auth id and account id cookie was set");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: auth user and account id set in cookie ",
            test: function () {
                // setup
                var authAndAccountId = ['bla@bla.com', 'contoso'];
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // act
                user.setAuthenticatedUserContext(authAndAccountId[0], authAndAccountId[1]);
                // verify
                Assert.equal(authAndAccountId[0], user.authenticatedId, "user auth id was set");
                Assert.equal(cookieStub.calledWithExactly('ai_authUser', encodeURI(authAndAccountId.join('|')), null), true, "user auth id cookie was set");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: handles only auth user id correctly",
            test: function () {
                // setup
                var authAndAccountId = ['bla@bla.com'];
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                // act
                user.setAuthenticatedUserContext(authAndAccountId[0]);
                // verify
                Assert.equal(authAndAccountId[0], user.authenticatedId, "user auth id was set");
                Assert.equal(null, user.accountId, "user account id was not set");
                Assert.equal(cookieStub.calledWithExactly('ai_authUser', encodeURI(authAndAccountId[0]), null), true, "user auth id cookie was set");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: handles null correctly",
            test: function () {
                // setup
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var loggingStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                cookieStub.reset();
                // act
                user.setAuthenticatedUserContext(null);
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was not set");
                Assert.equal(undefined, user.accountId, "user account id was not set");
                Assert.equal(cookieStub.notCalled, true, "cookie was not set");
                Assert.equal(loggingStub.calledOnce, true, "Warning was logged");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: handles undefined correctly",
            test: function () {
                // setup
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var loggingStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                // act
                user.setAuthenticatedUserContext(undefined, undefined);
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was not set");
                Assert.equal(undefined, user.accountId, "user account id was not set");
                Assert.equal(cookieStub.notCalled, true, "cookie was not set");
                Assert.equal(loggingStub.calledOnce, true, "Warning was logged");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: handles only accountID correctly",
            test: function () {
                // setup
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var loggingStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                // act
                user.setAuthenticatedUserContext(undefined, '1234');
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was not set");
                Assert.equal(undefined, user.accountId, "user account id was not set");
                Assert.equal(cookieStub.notCalled, true, "cookie was not set");
                Assert.equal(loggingStub.calledOnce, true, "Warning was logged");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: handles authId special characters correctly",
            test: function () {
                // setup
                var authAndAccountId = ['my|||special;id', '1234'];
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var loggingStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                // act
                user.setAuthenticatedUserContext(authAndAccountId[0], authAndAccountId[1]);
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was not set");
                Assert.equal(undefined, user.accountId, "user account id was not set");
                Assert.equal(cookieStub.notCalled, true, "cookie was not set");
                Assert.equal(loggingStub.calledOnce, true, "Warning was logged");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: handles accountId special characters correctly",
            test: function () {
                // setup
                var authAndAccountId = ['myid', '1234 5678'];
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                user.clearAuthenticatedUserContext();
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var loggingStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                // act
                user.setAuthenticatedUserContext(authAndAccountId[0], authAndAccountId[1]);
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was not set");
                Assert.equal(undefined, user.accountId, "user account id was not set");
                Assert.equal(cookieStub.notCalled, true, "cookie was not set");
                Assert.equal(loggingStub.calledOnce, true, "Warning was logged");
            }
        });
        this.testCase({
            name: "setAuthenticatedUserContext: handles non-ascii unicode characters correctly",
            test: function () {
                // setup
                var authAndAccountId = ["\u05D0", "\u05D1"]; // Hebrew characters
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie");
                var loggingStub = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                // act
                user.setAuthenticatedUserContext(authAndAccountId[0], authAndAccountId[1]);
                // verify
                Assert.equal(authAndAccountId[0], user.authenticatedId, "user auth id was set");
                Assert.equal(authAndAccountId[1], user.accountId, "user account id was set");
                Assert.equal(cookieStub.calledWithExactly('ai_authUser', encodeURI(authAndAccountId.join('|')), null), true, "user auth id cookie was set");
                Assert.equal(loggingStub.notCalled, true, "No warnings");
            }
        });
        this.testCase({
            name: "clearAuthenticatedUserContext: auth user and account cleared in context and cookie ",
            test: function () {
                // setup
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                user.setAuthenticatedUserContext("bla", "123");
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "deleteCookie");
                // act
                user.clearAuthenticatedUserContext();
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was cleared");
                Assert.equal(undefined, user.accountId, "user account id was cleared");
                Assert.equal(cookieStub.calledWithExactly('ai_authUser'), true, "cookie was deleted");
            }
        });
        this.testCase({
            name: "clearAuthenticatedUserContext: works correctly when auth id and account id were never set",
            test: function () {
                // setup
                var user = new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var cookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "deleteCookie");
                // act
                user.clearAuthenticatedUserContext();
                // verify
                Assert.equal(undefined, user.authenticatedId, "user auth id was cleared");
                Assert.equal(undefined, user.accountId, "user account id was cleared");
                Assert.equal(cookieStub.calledWithExactly('ai_authUser'), true, "cookie was deleted");
            }
        });
    };
    UserContextTests.prototype.getEmptyConfig = function () {
        return {
            instrumentationKey: function () { return null; },
            accountId: function () { return null; },
            sessionRenewalMs: function () { return null; },
            sessionExpirationMs: function () { return null; },
            sampleRate: function () { return null; },
            endpointUrl: function () { return null; },
            cookieDomain: function () { return null; },
            emitLineDelimitedJson: function () { return null; },
            maxBatchSizeInBytes: function () { return null; },
            maxBatchInterval: function () { return null; },
            disableTelemetry: function () { return null; },
            enableSessionStorageBuffer: function () { return null; },
            isRetryDisabled: function () { return null; },
            isBeaconApiDisabled: function () { return null; }
        };
    };
    return UserContextTests;
}(TestClass));
new UserContextTests().registerTests();
/// <reference path="../../../JavaScriptSDK/TelemetryContext.ts" />
/// <reference path="../../../JavaScriptSDK/context/session.ts" />
/// <reference path="../../../JavaScriptSDK/context/user.ts" />
/// <reference path="../../../JavaScriptSDK/ajax/ajaxUtils.ts" />
/// <reference path="../../testframework/common.ts" />
/// <reference path="../Util.tests.ts"/>
var SessionContextTests = (function (_super) {
    __extends(SessionContextTests, _super);
    function SessionContextTests() {
        _super.apply(this, arguments);
        this.originalDocument = Microsoft.ApplicationInsights.Util["document"];
        this.dateTimeNowObj = Microsoft.ApplicationInsights.dateTime.Now;
    }
    /** Method called before the start of each test method */
    SessionContextTests.prototype.testInitialize = function () {
        this.results = [];
        this.resetStorage();
        this.restoreFakeCookie();
        // SinonFakeTimers doesn't mock "performance.now" - https://github.com/sinonjs/lolex/issues/82 
        // this is a hack to mock the clock
        Microsoft.ApplicationInsights.dateTime.Now = Date.now;
    };
    /** Method called after each test method has completed */
    SessionContextTests.prototype.testCleanup = function () {
        this.results = [];
        this.resetStorage();
        this.restoreFakeCookie();
        // restore original dateTime.Now object
        Microsoft.ApplicationInsights.dateTime.Now = this.dateTimeNowObj;
    };
    SessionContextTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "SessionContext: session manager does not initialize automatic session in constructor",
            test: function () {
                // no cookie, isNew should be true
                Microsoft.ApplicationInsights.Util["document"] = {
                    cookie: ""
                };
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                Assert.ok(!sessionManager.automaticSession.isFirst, "isFirst");
                Assert.ok(!sessionManager.automaticSession.id, "id");
                Assert.ok(!sessionManager.automaticSession.acquisitionDate, "acquisitionDate");
                Assert.ok(!sessionManager.automaticSession.renewalDate, "renewalDate");
            }
        });
        this.testCase({
            name: "SessionContext: session manager updates isFirst field correctly",
            test: function () {
                // no cookie, isNew should be true  
                Microsoft.ApplicationInsights.Util["document"] = {
                    cookie: ""
                };
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                // after first update, should be true  
                _this.clock.tick(10);
                sessionManager.update();
                Assert.ok(sessionManager.automaticSession.isFirst, "isFirst should be true after 1st update");
                // after second update also true  
                sessionManager.update();
                Assert.ok(sessionManager.automaticSession.isFirst, "isFirst should be true after 2st update");
                // after renewal, should be false  
                _this.clock.tick(Microsoft.ApplicationInsights.Context._SessionManager.renewalSpan + 1);
                sessionManager.update();
                Assert.ok(!sessionManager.automaticSession.isFirst, "isFirst should be false after renewal");
            }
        });
        this.testCase({
            name: "SessionContext: when sessionmanager initailzes it sets isFirst to false if cookie is present",
            test: function () {
                // no cookie, isNew should be true  
                Microsoft.ApplicationInsights.Util["document"] = {
                    cookie: ""
                };
                _this.clock.tick(10);
                var sessionManager1 = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager1.update();
                _this.clock.tick(Microsoft.ApplicationInsights.Context._SessionManager.renewalSpan + 1);
                // Creating one more instance immulate that browser was closed  
                var sessionManager2 = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager2.update();
                Assert.ok(!sessionManager2.automaticSession.isFirst, "isFirst should be false because it is same browser/user");
            }
        });
        this.testCase({
            name: "ai_session cookie has correct structure",
            test: function () {
                // setup
                var actualCookieName;
                var actualCookieValue;
                var newIdStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "newId", function () { return "newId"; });
                var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return ""; });
                var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (cookieName, cookieValue) {
                    actualCookieName = cookieName;
                    actualCookieValue = cookieValue;
                });
                // act
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                // verify
                Assert.equal("ai_session", actualCookieName, "ai_session cookie is set");
                var cookieValueParts = actualCookieValue.split(';');
                Assert.equal(2, cookieValueParts.length, "Cookie value should have actual value and expiration");
                Assert.equal(3, cookieValueParts[0].split('|').length, "Cookie value before expiration should include user id, acq date and renew date");
                Assert.equal("newId", cookieValueParts[0].split('|')[0], "First part of cookie value should be new user id guid");
                // The cookie should expire 30 minutes after activity by default
                var expiration = cookieValueParts[1];
                Assert.equal(true, expiration.substr(0, "expires=".length) === "expires=", "Cookie expiration part should start with expires=");
                var expirationDate = new Date(expiration.substr("expires=".length));
                Assert.equal(30, expirationDate.getTime() / 1000 / 60, "cookie expiration should be in 30 minutes");
            }
        });
        this.testCase({
            name: "ai_session local storage has correct structure",
            test: function () {
                if (Microsoft.ApplicationInsights.Util.canUseLocalStorage()) {
                    // setup
                    var actualCookieName;
                    var actualCookieValue;
                    var newIdStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "newId", function () { return "newId"; });
                    var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function () { return ""; });
                    var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (cookieName, cookieValue) { });
                    // act
                    var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                    sessionManager.update();
                    sessionManager.backup();
                    // verify
                    Assert.ok(localStorage["ai_session"], "ai_session storage is set");
                    Assert.equal(3, localStorage["ai_session"].split('|').length, "Cookie value before expiration should include user id, acq date and renew date");
                    Assert.equal("newId", localStorage["ai_session"].split('|')[0], "First part of cookie value should be new user id guid");
                }
                else {
                    // this might happen on IE when using a file:// url
                    Assert.ok(true, "browser does not support local storage in current environment");
                }
            }
        });
        this.testCase({
            name: "SessionContext: session manager can back up session when localStorage is available",
            test: function () {
                var cookies = {};
                var storage = {};
                var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function (name) { return cookies[name]; });
                var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (name, value) {
                    cookies[name] = value;
                });
                var getStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getStorage", function (name) { return storage[name]; });
                var setStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setStorage", function (name, value) {
                    storage[name] = value;
                });
                // Initialize our user and session cookies
                var sessionId = "SESSID";
                var curDate = Microsoft.ApplicationInsights.dateTime.Now();
                cookies['ai_user'] = 'user';
                cookies['ai_session'] = _this.generateFakeSessionCookieData(sessionId, curDate, curDate);
                // Ensure session manager backs up properly
                new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                sessionManager.backup();
                Assert.ok(storage['ai_session'], "session cookie should be backed up in local storage");
            }
        });
        this.testCase({
            name: "SessionContext: session manager can recover old session id and isFirst state from lost cookies when localStorage is available",
            test: function () {
                var cookies = {};
                var storage = {};
                var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function (name) { return cookies[name]; });
                var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (name, value) {
                    cookies[name] = value;
                });
                var getStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getStorage", function (name) { return storage[name]; });
                var setStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setStorage", function (name, value) {
                    storage[name] = value;
                });
                // Initialize our user cookie and local storage
                // Note there is no session cookie
                var sessionId = "SESSID";
                var curDate = Microsoft.ApplicationInsights.dateTime.Now();
                cookies['ai_user'] = 'user';
                storage['ai_session'] = _this.generateFakeSessionCookieData(sessionId, curDate, curDate);
                // Initalize the session manager
                new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                sessionManager.backup();
                // We should recover
                Assert.equal(sessionId, sessionManager.automaticSession.id, "session id should be consistent with value before losing session cookie");
                Assert.ok(!sessionManager.automaticSession.isFirst, "the isFirst state should be conserved after losing the session cookie");
            }
        });
        this.testCase({
            name: "SessionContext: session manager uses a new session when user cookie is deleted despite local storage being available",
            test: function () {
                var cookies = {};
                var storage = {};
                var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function (name) { return cookies[name]; });
                var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (name, value) {
                    cookies[name] = value;
                });
                var getStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getStorage", function (name) { return storage[name]; });
                var setStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setStorage", function (name, value) {
                    storage[name] = value;
                });
                var removeStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "removeStorage", function (name, value) {
                    storage[name] = undefined;
                });
                // Initialize our local storage
                // Note no cookies are available
                var sessionId = "SESSID";
                var curDate = Microsoft.ApplicationInsights.dateTime.Now();
                storage['ai_session'] = _this.generateFakeSessionCookieData(sessionId, curDate, curDate);
                // Initialize the session manager
                new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                // Verify the backup was lost
                Assert.ok(!storage['ai_session'], "the local storage backup should be removed");
                // Everything should be reset with the backup removed
                Assert.notEqual(sessionId, sessionManager.automaticSession.id, "a new session id should be given after losing all ai cookies");
                Assert.ok(sessionManager.automaticSession.isFirst, "the isFirst state should be reset after losing all ai cookies");
            }
        });
        this.testCase({
            name: "SessionContext: session manager cannot recover old session id and isFirst state from lost cookies when localStorage is unavailable",
            test: function () {
                var cookies = {};
                var storage = {};
                var getCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getCookie", function (name) { return cookies[name]; });
                var setCookieStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setCookie", function (name, value) {
                    cookies[name] = value;
                });
                var getStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "getStorage", function (name) { return null; });
                var setStorageStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, "setStorage", function (name, value) { return false; });
                // Initialize our user and session cookies
                var sessionId = "SESSID";
                var curDate = Microsoft.ApplicationInsights.dateTime.Now();
                cookies['ai_user'] = 'user';
                cookies['ai_session'] = _this.generateFakeSessionCookieData(sessionId, curDate, curDate);
                // Back up the session
                new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                sessionManager.backup();
                // Lose the session cookie but not the user cookie
                cookies['ai_session'] = undefined;
                new Microsoft.ApplicationInsights.Context.User(_this.getEmptyConfig());
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                sessionManager.backup();
                // The lost cookie should not be recovered from
                Assert.notEqual(sessionId, sessionManager.automaticSession.id, "a new session id should be given after losing the session cookie");
                Assert.ok(sessionManager.automaticSession.isFirst, "the isFirst state should be reset after losing the session cookie");
            }
        });
        this.testCase({
            name: "SessionContext: session manager sets the isFirst to false if cookie was present",
            test: function () {
                // no cookie, isNew should be true  
                Microsoft.ApplicationInsights.Util["document"] = {
                    cookie: ""
                };
                var testGuid = "00000000-0000-0000-0000-000000000000";
                var acquisitionDate = Microsoft.ApplicationInsights.dateTime.Now();
                var renewalDate = Microsoft.ApplicationInsights.dateTime.Now();
                _this.setFakeCookie(testGuid, acquisitionDate, renewalDate);
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                Assert.ok(!sessionManager.automaticSession.isFirst, "isFirst is false when an existing session was set");
            }
        });
        this.testCase({
            name: "SessionContext: session manager honors session from the cookie",
            test: function () {
                // setup
                var testGuid = "00000000-0000-0000-0000-000000000000";
                var acquisitionDate = Microsoft.ApplicationInsights.dateTime.Now();
                var renewalDate = Microsoft.ApplicationInsights.dateTime.Now();
                _this.setFakeCookie(testGuid, acquisitionDate, renewalDate);
                // act
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                // verify
                Assert.equal(testGuid, sessionManager.automaticSession.id, "cookie session id was used");
                Assert.equal(+new Date(acquisitionDate), sessionManager.automaticSession.acquisitionDate, "cookie acquisitionDate was used");
                Assert.equal(+new Date(renewalDate), sessionManager.automaticSession.renewalDate, "cookie renewalDate was used");
            }
        });
        this.testCase({
            name: "SessionContext: session manager renews when renewal date has expired",
            test: function () {
                // setup
                var testGuid = "00000000-0000-0000-0000-000000000000";
                var delta = (Microsoft.ApplicationInsights.Context._SessionManager.renewalSpan + 1);
                _this.clock.tick(delta); // safari crashes without this
                var cookieTime = +new Date - delta;
                var acquisitionDate = +new Date(cookieTime);
                var renewalDate = +new Date(cookieTime);
                _this.setFakeCookie(testGuid, acquisitionDate, renewalDate);
                // act
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                // verify
                Assert.notEqual(testGuid, sessionManager.automaticSession.id, "cookie session id was renewed");
                Assert.equal(delta, sessionManager.automaticSession.acquisitionDate, "cookie acquisitionDate was updated");
                Assert.equal(delta, sessionManager.automaticSession.renewalDate, "cookie renewalDate was updated");
            }
        });
        this.testCase({
            name: "SessionContext: session manager renews when acquisition date has expired",
            test: function () {
                // setup
                var testGuid = "00000000-0000-0000-0000-000000000000";
                var delta = (Microsoft.ApplicationInsights.Context._SessionManager.acquisitionSpan + 1);
                _this.clock.tick(delta); // safari crashes without this
                var cookieTime = +new Date - delta;
                var acquisitionDate = +new Date(cookieTime);
                var renewalDate = Microsoft.ApplicationInsights.dateTime.Now();
                _this.setFakeCookie(testGuid, acquisitionDate, renewalDate);
                // act
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                sessionManager.update();
                // verify
                Assert.notEqual(testGuid, sessionManager.automaticSession.id, "cookie session id was renewed");
                Assert.equal(delta, sessionManager.automaticSession.acquisitionDate, "cookie acquisitionDate was updated");
                Assert.equal(delta, sessionManager.automaticSession.renewalDate, "cookie renewalDate was updated");
            }
        });
        this.testCase({
            name: "SessionContext: the cookie is not updated more often than cookieUpdateInterval",
            test: function () {
                var cookieInterval = Microsoft.ApplicationInsights.Context._SessionManager.cookieUpdateInterval;
                // setup
                var testGuid = "00000000-0000-0000-0000-000000000000";
                var acquisitionDate = Microsoft.ApplicationInsights.dateTime.Now();
                var renewalDate = Microsoft.ApplicationInsights.dateTime.Now();
                _this.setFakeCookie(testGuid, acquisitionDate, renewalDate);
                // create session manager and call update to set the cookie
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                var setCookieSpy = _this.sandbox.spy(sessionManager, "setCookie");
                _this.clock.tick(10);
                sessionManager.update();
                // verify
                Assert.equal(1, setCookieSpy.callCount, "setCookie should be called only once");
                Assert.equal(10, sessionManager.automaticSession.renewalDate, "cookie renewalDate was updated");
                // try updating the cookie before the cookieUpdateInterval elapsed
                _this.clock.tick(cookieInterval - 1);
                sessionManager.update();
                // verify
                Assert.equal(1, setCookieSpy.callCount, "setCookie should not be colled before cookieUpdateInterval elapsed");
                Assert.equal(10, sessionManager.automaticSession.renewalDate, "cookie renewalDate was NOT updated");
                // wait few more milliseconds till the cookieUpdateInterval elapsed
                _this.clock.tick(2);
                sessionManager.update();
                Assert.equal(2, setCookieSpy.callCount, "setCookie should be called after the cookieUpdateInterval elapsed");
                Assert.equal(cookieInterval + 10 + 1, sessionManager.automaticSession.renewalDate, "cookie renewalDate was updated");
            }
        });
        this.testCase({
            name: "SessionContext: session manager updates renewal date when updated",
            test: function () {
                // setup
                var testGuid = "00000000-0000-0000-0000-000000000000";
                var acquisitionDate = Microsoft.ApplicationInsights.dateTime.Now();
                var renewalDate = Microsoft.ApplicationInsights.dateTime.Now();
                _this.setFakeCookie(testGuid, acquisitionDate, renewalDate);
                // act
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(null);
                _this.clock.tick(10);
                sessionManager.update();
                // verify
                Assert.equal(testGuid, sessionManager.automaticSession.id, "cookie session id was not renewed");
                Assert.equal(0, sessionManager.automaticSession.acquisitionDate, "cookie acquisitionDate was updated");
                Assert.equal(10, sessionManager.automaticSession.renewalDate, "cookie renewalDate was updated");
            }
        });
        this.testCase({
            name: "SessionContext: config overrides work",
            test: function () {
                // setup
                var sessionRenewalMs = 5;
                var sessionExpirationMs = 10;
                var config = {
                    sessionRenewalMs: function () { return sessionRenewalMs; },
                    sessionExpirationMs: function () { return sessionExpirationMs; },
                    cookieDomain: function () { return undefined; }
                };
                // act
                var sessionManager = new Microsoft.ApplicationInsights.Context._SessionManager(config);
                // verify
                Assert.equal(sessionRenewalMs, sessionManager.config.sessionRenewalMs(), "config sessionRenewalMs is set correctly");
                Assert.equal(sessionExpirationMs, sessionManager.config.sessionExpirationMs(), "config sessionExpirationMs is set correctly");
                // act
                sessionRenewalMs = 6;
                sessionExpirationMs = 11;
                // verify
                Assert.equal(sessionRenewalMs, sessionManager.config.sessionRenewalMs(), "config sessionRenewalMs is updated correctly");
                Assert.equal(sessionExpirationMs, sessionManager.config.sessionExpirationMs(), "config sessionExpirationMs is updated correctly");
            }
        });
    };
    SessionContextTests.prototype.setFakeCookie = function (id, acqDate, renewalDate) {
        this.originalDocument = Microsoft.ApplicationInsights.Util["document"];
        Microsoft.ApplicationInsights.Util["document"] = {
            cookie: "ai_user=user; ai_session=" + this.generateFakeSessionCookieData(id, acqDate, renewalDate)
        };
    };
    SessionContextTests.prototype.generateFakeSessionCookieData = function (id, acqDate, renewalDate) {
        return [id, acqDate, renewalDate].join("|");
    };
    SessionContextTests.prototype.restoreFakeCookie = function () {
        Microsoft.ApplicationInsights.Util["document"] = this.originalDocument;
    };
    SessionContextTests.prototype.resetStorage = function () {
        if (Microsoft.ApplicationInsights.Util.canUseLocalStorage()) {
            window.localStorage.clear();
        }
    };
    SessionContextTests.prototype.getEmptyConfig = function () {
        return {
            instrumentationKey: function () { return null; },
            accountId: function () { return null; },
            sessionRenewalMs: function () { return null; },
            sessionExpirationMs: function () { return null; },
            sampleRate: function () { return null; },
            endpointUrl: function () { return null; },
            cookieDomain: function () { return null; },
            emitLineDelimitedJson: function () { return null; },
            maxBatchSizeInBytes: function () { return null; },
            maxBatchInterval: function () { return null; },
            disableTelemetry: function () { return null; },
            enableSessionStorageBuffer: function () { return null; },
            isRetryDisabled: function () { return null; },
            isBeaconApiDisabled: function () { return null; }
        };
    };
    return SessionContextTests;
}(TestClass));
new SessionContextTests().registerTests();
/// <reference path="../../JavaScriptSDK/serializer.ts" />
/// <reference path="./TestClass.ts"/>
var ContractTestHelper = (function (_super) {
    __extends(ContractTestHelper, _super);
    function ContractTestHelper(initializer, name) {
        _super.call(this);
        this.name = name;
        this.initializer = initializer;
    }
    /** Method called before the start of each test method */
    ContractTestHelper.prototype.testInitialize = function () {
    };
    /** Method called after each test method has completed */
    ContractTestHelper.prototype.testCleanup = function () {
    };
    ContractTestHelper.prototype.registerTests = function () {
        var _this = this;
        var name = this.name + ": ";
        this.testCase({
            name: name + "constructor does not throw errors",
            test: function () {
                _this.getSubject(_this.initializer, _this.name);
            }
        });
        this.testCase({
            name: name + "serialization does not throw errors",
            test: function () {
                var subject = _this.getSubject(_this.initializer, _this.name);
                _this.serialize(subject, _this.name);
            }
        });
        this.testCase({
            name: name + "all required fields are constructed",
            test: function () {
                _this.allRequiredFieldsAreConstructed(_this.initializer, _this.name);
            }
        });
        this.testCase({
            name: name + "extra fields are removed upon serialization",
            test: function () {
                _this.extraFieldsAreRemovedBySerializer(_this.initializer, _this.name);
            }
        });
        this.testCase({
            name: this.name + "optional fields are not required by the back end",
            test: function () {
                _this.optionalFieldsAreNotRequired(_this.initializer, _this.name);
            }
        });
        this.testCase({
            name: this.name + "all fields are serialized if included",
            test: function () {
                _this.allFieldsAreIncludedIfSpecified(_this.initializer, _this.name);
            }
        });
    };
    ContractTestHelper.prototype.checkSerializableObject = function (initializer, name) {
        this.allRequiredFieldsAreConstructed(initializer, name);
        this.extraFieldsAreRemovedBySerializer(initializer, name);
        this.allFieldsAreIncludedIfSpecified(initializer, name);
    };
    ContractTestHelper.prototype.allRequiredFieldsAreConstructed = function (initializer, name) {
        var subject = this.getSubject(initializer, name);
        for (var field in subject.aiDataContract) {
            if (subject.aiDataContract[field] & Microsoft.ApplicationInsights.FieldType.Required) {
                Assert.ok(subject[field] != null, "The required field '" + field + "' is constructed for: '" + name + "'");
            }
        }
    };
    ContractTestHelper.prototype.extraFieldsAreRemovedBySerializer = function (initializer, name) {
        var subject = this.getSubject(initializer, name);
        var extra = "extra";
        subject[extra + 0] = extra;
        subject[extra + 1] = extra;
        subject[extra + 3] = extra;
        var serializedSubject = this.serialize(subject, name);
        for (var field in serializedSubject) {
            Assert.ok(subject.aiDataContract[field] != null, "The field '" + field + "' exists in the contract for '" + name + "' and was serialized");
        }
    };
    ContractTestHelper.prototype.optionalFieldsAreNotRequired = function (initializer, name) {
        var subject = this.getSubject(this.initializer, this.name);
        for (var field in subject.aiDataContract) {
            if (!subject.aiDataContract[field]) {
                delete subject[field];
            }
        }
    };
    ContractTestHelper.prototype.allFieldsAreIncludedIfSpecified = function (initializer, name) {
        var subject = this.getSubject(this.initializer, this.name);
        for (var field in subject.aiDataContract) {
            subject[field] = field;
        }
        var serializedSubject = this.serialize(subject, this.name);
        for (field in subject.aiDataContract) {
            Assert.ok(serializedSubject[field] === field, "Field '" + field + "' was not serialized" + this.name);
        }
        for (field in serializedSubject) {
            Assert.ok(subject.aiDataContract[field] !== undefined, "Field '" + field + "' was included but is not specified in the contract " + this.name);
        }
    };
    ContractTestHelper.prototype.serialize = function (subject, name) {
        var serialized = "";
        try {
            serialized = Microsoft.ApplicationInsights.Serializer.serialize(subject);
        }
        catch (e) {
            Assert.ok(false, "Failed to serialize '" + name + "'\r\n" + e);
        }
        return JSON.parse(serialized);
    };
    ContractTestHelper.prototype.getSubject = function (construction, name) {
        var subject = construction();
        Assert.ok(!!subject, "can construct " + name);
        return subject;
    };
    return ContractTestHelper;
}(TestClass));
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../testframework/contracttesthelper.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/event.ts" />
var EventTelemetryTests = (function (_super) {
    __extends(EventTelemetryTests, _super);
    function EventTelemetryTests() {
        _super.call(this, function () { return new Microsoft.ApplicationInsights.Telemetry.Event("test"); }, "EventTelemetryTests");
    }
    /** Method called before the start of each test method */
    EventTelemetryTests.prototype.testInitialize = function () {
        delete Microsoft.ApplicationInsights.Telemetry.Event["__extends"];
    };
    EventTelemetryTests.prototype.registerTests = function () {
        _super.prototype.registerTests.call(this);
        var name = this.name + ": ";
        this.testCase({
            name: name + "Constructor initializes the name",
            test: function () {
                var eventName = "test";
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Event(eventName);
                Assert.equal(eventName, telemetry.name, "event name is set correctly");
            }
        });
        this.testCase({
            name: name + "Constructor sanitizes the name",
            test: function () {
                var char10 = "1234567890";
                var eventName = char10;
                for (var i = 0; i <= 200; i++) {
                    eventName += char10;
                }
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Event(eventName);
                Assert.equal(1024, telemetry.name.length, "event name is too long");
            }
        });
    };
    return EventTelemetryTests;
}(ContractTestHelper));
new EventTelemetryTests().registerTests();
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../testframework/contracttesthelper.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/exception.ts" />
/// <reference path="../../../JavaScriptSDK.Interfaces/Contracts/Generated/SeverityLevel.ts" />
var ExceptionTelemetryTests = (function (_super) {
    __extends(ExceptionTelemetryTests, _super);
    function ExceptionTelemetryTests() {
        _super.call(this, function () { return new Microsoft.ApplicationInsights.Telemetry.Exception(new Error("test error")); }, "ExceptionTelemetryTests");
    }
    ExceptionTelemetryTests.prototype.registerTests = function () {
        _super.prototype.registerTests.call(this);
        var name = this.name + ": ";
        this.testCase({
            name: name + "Exceptions array is initialized in constructor",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Exception(new Error("test error"));
                Assert.ok(telemetry.exceptions, "exceptions were initialized by the constructor");
                Assert.equal(telemetry.exceptions.length, 1, "incorrect number of exceptions");
            }
        });
        this.testCase({
            name: name + "HandledAt is initialized in constructor",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Exception(new Error("test error"), "HA");
                Assert.equal(telemetry.handledAt, "HA");
            }
        });
        this.testCase({
            name: name + "Exception is initialized with undefined severityLevel",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Exception(new Error("test error"), "HA");
                Assert.equal(undefined, telemetry.severityLevel, "Exception shouldn't have severity level by default");
            }
        });
        this.testCase({
            name: name + "User can override severityLevel",
            test: function () {
                var level = AI.SeverityLevel.Critical;
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Exception(new Error("test error"), "HA", null, null, level);
                Assert.equal(level, telemetry.severityLevel, "Exception has proper severity level");
            }
        });
        this.testCase({
            name: name + "Exception stack is limited to 32kb",
            test: function () {
                // setup
                var testError = {
                    name: "Error",
                    message: "Test - stack is too large",
                    stack: "Error: testMaxSize"
                };
                var rawStackFrame = "\nat function" + i + " (http://myScript.js:" + i + ":20)";
                var maxSize = 32 * 1024;
                for (var i = 0; i < maxSize; i++) {
                    testError.stack += rawStackFrame;
                }
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Exception(testError);
                var exception = telemetry.exceptions[0];
                // verify unparsed stack is truncated
                Assert.ok(exception.stack.length === maxSize, "max size was applied to raw stack");
                // verify parsed stack is truncated
                var fullStr = JSON.stringify(exception);
                var postSerializedException = JSON.parse(fullStr);
                var parsedStackStr = JSON.stringify(postSerializedException.parsedStack);
                Assert.ok(parsedStackStr.length <= maxSize, "parsed stack was truncated");
            }
        });
        this.testCase({
            name: name + "ExceptionTelemetry captures required data from input Error object",
            test: function () {
                var testErrors = [
                    {
                        name: "Error",
                        message: "chrome formatted error",
                        stack: "\
Error: testmessage1\n\
    at new PageViewPerformanceData (http://myScript.js:10:20)\n\
    at new PageViewPerformanceTelemetry (http://myScript.js:30:40)\n\
    at http://myScript.js:40:50\n\
    at myFunction (http://myScript.js:60:70)\n\
    at <anonymous>:80:90"
                    }, {
                        name: "Error",
                        message: "firefox formatted error",
                        stack: "\
PageViewPerformanceData@http://myScript.js:10:20\n\
PageViewPerformanceTelemetry@http://myScript.js:30:40\n\
@http://myScript.js:40:50\n\
myFunction@http://myScript.js:60:70\n\
@anonymous debugger eval code:80:90"
                    }, {
                        name: "Error",
                        message: "ie formatted error",
                        stack: "\
Error: testmessage2\n\
    at PageViewPerformanceData (http://myScript.js:10:20)\n\
    at PageViewPerformanceTelemetry (http://myScript.js:30:40)\n\
    at http://myScript.js:40:50\n\
    at myFunction (http://myScript.js:60:70)\n\
    at anonymous function (http://myScript.js:80:90)"
                    }
                ];
                var fuzzyStringMatch = function (a, b) {
                    if (typeof a === "number") {
                        return a === b ? 1 : 0;
                    }
                    else if (a === b) {
                        return 1;
                    }
                    else {
                        var map = {};
                        for (var i = 1; i < a.length; i++) {
                            map[a[i - 1] + a[i]] = true;
                        }
                        var matches = 0;
                        for (i = 1; i < b.length; i++) {
                            if (map[b[i - 1] + b[i]]) {
                                matches++;
                            }
                        }
                        var len = Math.max(a.length, b.length) || 1;
                        return matches / len;
                    }
                };
                var test = function (first, second) {
                    Assert.ok(first.hasFullStack, first.message + " has full stack");
                    Assert.ok(second.hasFullStack, second.message + " has full stack");
                    Assert.equal(first.parsedStack.length, second.parsedStack.length, first.message + " stack length matches " + second.message);
                    // -1 to skip the last field which contains anonymous stack frame which varies widely between browsers
                    for (var i = 0; i < first.parsedStack.length - 1; i++) {
                        var fields = ["method", "line", "fileName", "level"];
                        var matchLevel = [0.7, 1, 0.7, 1];
                        while (fields.length) {
                            var field = fields.pop();
                            var requiredMatch = matchLevel.pop();
                            var similarity = fuzzyStringMatch(first.parsedStack[i][field], second.parsedStack[i][field]);
                            Assert.ok(similarity >= requiredMatch, field + " matches between: (" + first.message + ") and (" + second.message + ") by " + Math.round(similarity * 10000) / 100 + "%  ---  [" + first.parsedStack[i][field] + "]  vs.  [" + second.parsedStack[i][field] + "]");
                        }
                    }
                };
                var getFrame = function (testError) {
                    var telemetry = new Microsoft.ApplicationInsights.Telemetry.Exception(testError);
                    return telemetry.exceptions[0];
                };
                var chrome = getFrame(testErrors[0]);
                var firefox = getFrame(testErrors[1]);
                var ie = getFrame(testErrors[2]);
                test(chrome, firefox);
                test(chrome, ie);
                test(firefox, chrome);
                test(firefox, ie);
                test(ie, chrome);
                test(ie, firefox);
            }
        });
        this.testCase({
            name: "CreateSimpleException returns Exception instance with specified properties",
            test: function () {
                var expectedMessage = "Test Message";
                var expectedTypeName = "Test Type Name";
                var expectedDetails = "Test Details";
                var expectedAssembly = "Test Assembly";
                var expectedFileName = "Test File Name";
                var expectedLineNumber = 42;
                var expectedHandledAt = "Test Handled At";
                var actual = Microsoft.ApplicationInsights.Telemetry.Exception.CreateSimpleException(expectedMessage, expectedTypeName, expectedAssembly, expectedFileName, expectedDetails, expectedLineNumber, expectedHandledAt);
                Assert.equal(expectedMessage, actual.exceptions[0].message);
                Assert.equal(expectedTypeName, actual.exceptions[0].typeName);
                Assert.equal(expectedDetails, actual.exceptions[0].stack);
                Assert.equal(true, actual.exceptions[0].hasFullStack);
                Assert.equal(0, actual.exceptions[0].parsedStack[0].level);
                Assert.equal(expectedAssembly, actual.exceptions[0].parsedStack[0].assembly);
                Assert.equal(expectedFileName, actual.exceptions[0].parsedStack[0].fileName);
                Assert.equal(expectedLineNumber, actual.exceptions[0].parsedStack[0].line);
                Assert.equal("unknown", actual.exceptions[0].parsedStack[0].method);
                Assert.equal(expectedHandledAt, actual.handledAt);
            }
        });
        this.testCase({
            name: "Stack trace with no method serializes as <no_method>",
            test: function () {
                // Act
                var sut = new Microsoft.ApplicationInsights.Telemetry._StackFrame("    at http://myScript.js:40:50", 1);
                // Verify
                Assert.equal("<no_method>", sut.method);
            }
        });
    };
    return ExceptionTelemetryTests;
}(ContractTestHelper));
new ExceptionTelemetryTests().registerTests();
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../testframework/contracttesthelper.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/metric.ts" />
var metricName = "test";
var metricValue = 42;
var MetricTelemetryTests = (function (_super) {
    __extends(MetricTelemetryTests, _super);
    function MetricTelemetryTests() {
        _super.call(this, function () { return new Microsoft.ApplicationInsights.Telemetry.Metric(metricName, metricValue); }, "MetricTelemetryTests");
    }
    MetricTelemetryTests.prototype.registerTests = function () {
        _super.prototype.registerTests.call(this);
        var name = this.name + ": ";
        this.testCase({
            name: name + "MetricTelemetry captures required data from user",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Metric(metricName, metricValue);
                Assert.equal(metricName, telemetry.metrics[0].name, "name is incorrect");
                Assert.equal(metricValue, telemetry.metrics[0].value, "value is incorrect");
            }
        });
    };
    return MetricTelemetryTests;
}(ContractTestHelper));
new MetricTelemetryTests().registerTests();
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../testframework/contracttesthelper.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/pageviewperformance.ts" />
var PageViewPerformanceTelemetryTests = (function (_super) {
    __extends(PageViewPerformanceTelemetryTests, _super);
    function PageViewPerformanceTelemetryTests() {
        _super.call(this, function () { return new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("name", "url", 0); }, "PageViewPerformanceTelemetryTests");
    }
    PageViewPerformanceTelemetryTests.prototype.testCleanup = function () {
        // Reset verboseLogging to the default value
        Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return false; };
    };
    PageViewPerformanceTelemetryTests.prototype.registerTests = function () {
        var _this = this;
        _super.prototype.registerTests.call(this);
        var name = this.name + ": ";
        this.testCase({
            name: name + "getDuration() calculates a correct duration",
            test: function () {
                var duration = Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.getDuration(10, 20);
                Assert.equal(10, duration, "20 - 10 == 10");
                duration = Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.getDuration(1, 1);
                Assert.equal(0, duration, "1 - 1 == 0");
                duration = Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.getDuration(100, 99);
                Assert.equal(0, duration, "99 - 100 -> 0");
            }
        });
        this.testCase({
            name: name + "getDuration() returns undefined for invalid inputs",
            test: function () {
                var duration = Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.getDuration(10, undefined);
                Assert.equal(undefined, duration);
                duration = Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.getDuration("ab", 123);
                Assert.equal(undefined, duration);
                duration = Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.getDuration(undefined, null);
                Assert.equal(undefined, duration);
            }
        });
        this.testCase({
            name: name + "PageViewPerformanceTelemetry correct timing data",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("name", "url", 0);
                var isAvailable = window.performance && window.performance.timing; // safari doesn't support this
                if (isAvailable) {
                    Assert.equal(typeof telemetry.perfTotal, "string");
                    Assert.equal(typeof telemetry.networkConnect, "string");
                    Assert.equal(typeof telemetry.receivedResponse, "string");
                    Assert.equal(typeof telemetry.sentRequest, "string");
                    Assert.equal(typeof telemetry.domProcessing, "string");
                }
                else {
                    var check = Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.isPerformanceTimingSupported();
                    Assert.equal(false, check, "isPerformanceTimingSupported returns false when not performance timing is not supported");
                }
            }
        });
        this.testCase({
            name: name + "PageViewPerformanceTelemetry has correct serialization contract",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("name", "url", 0);
                Assert.equal(Microsoft.ApplicationInsights.FieldType.Required, telemetry.aiDataContract.ver, "version fields is required");
                // all other fields are optional
                for (var field in telemetry.aiDataContract) {
                    if (field == "ver") {
                        continue;
                    }
                    var contract = telemetry.aiDataContract[field];
                    Assert.notEqual(true, contract.isRequired, field + " is not required");
                }
            }
        });
        this.testCase({
            name: name + "PageViewPerformanceTelemetry measurements are correct",
            test: function () {
                var timing = {};
                timing.navigationStart = 1;
                timing.connectEnd = 10;
                timing.requestStart = 11;
                timing.responseStart = 30;
                timing.responseEnd = 42;
                timing.loadEventEnd = 60;
                var timingSpy = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                    return timing;
                });
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("name", "url", 0);
                Assert.equal(true, telemetry.getIsValid());
                var data = telemetry;
                Assert.equal(Microsoft.ApplicationInsights.Util.msToTimeSpan(59), data.perfTotal);
                Assert.equal(Microsoft.ApplicationInsights.Util.msToTimeSpan(9), data.networkConnect);
                Assert.equal(Microsoft.ApplicationInsights.Util.msToTimeSpan(19), data.sentRequest);
                Assert.equal(Microsoft.ApplicationInsights.Util.msToTimeSpan(12), data.receivedResponse);
                Assert.equal(Microsoft.ApplicationInsights.Util.msToTimeSpan(18), data.domProcessing);
            }
        });
        this.testCase({
            name: name + "PageViewPerformanceTelemetry detects when perf data is sent by the browser incorrectly and doesn't send it",
            test: function () {
                var timing = {};
                timing.navigationStart = 1;
                timing.connectEnd = 40;
                timing.requestStart = 11;
                timing.responseStart = 30;
                timing.responseEnd = 42;
                timing.loadEventEnd = 60;
                var timingSpy = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                    return timing;
                });
                var actualLoggedMessage = null;
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                var loggingSpy = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "warnToConsole", function (m) { return actualLoggedMessage = m; });
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("name", "url", 0);
                Assert.equal(false, telemetry.getIsValid());
                var data = telemetry;
                Assert.equal(undefined, data.perfTotal);
                Assert.equal(undefined, data.networkConnect);
                Assert.equal(undefined, data.sentRequest);
                Assert.equal(undefined, data.receivedResponse);
                Assert.equal(undefined, data.domProcessing);
                Assert.equal("AI (Internal): ClientPerformanceMathError message:\"client performance math error.\" props:\"{total:59,network:39,request:19,response:12,dom:18}\"", actualLoggedMessage);
            }
        });
        this.testCase({
            name: name + "PageViewPerformanceTelemetry is not reporting duration if a request is comming from a Googlebot",
            test: function () {
                // mock user agent
                var originalUserAgent = navigator.userAgent;
                _this.setUserAgent("Googlebot/2.1");
                var timing = {};
                timing.navigationStart = 1;
                timing.connectEnd = 2;
                timing.requestStart = 3;
                timing.responseStart = 30;
                timing.responseEnd = 42;
                timing.loadEventEnd = 60;
                var timingSpy = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                    return timing;
                });
                var actualLoggedMessage = "";
                Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                var loggingSpy = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "warnToConsole", function (m) { return actualLoggedMessage = m; });
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("name", "url", 0);
                Assert.equal(false, telemetry.getIsValid());
                var data = telemetry;
                Assert.equal(undefined, data.perfTotal);
                Assert.equal(undefined, data.networkConnect);
                Assert.equal(undefined, data.sentRequest);
                Assert.equal(undefined, data.receivedResponse);
                Assert.equal(undefined, data.domProcessing);
                timingSpy.restore();
                loggingSpy.restore();
                // restore original user agent
                _this.setUserAgent(originalUserAgent);
            }
        });
        this.testCase({
            name: name + "PageViewPerformanceTelemetry checks if any duration exceeds 1h and don't send it",
            test: function () {
                // see comment PageViewPerformance constructor on how timing data is calculated
                // here we set values, so each metric will be exactly 3600000 (1h).
                var timingModifiers = [function (timing) { return timing.loadEventEnd = 3600001; },
                    function (timing) { return timing.connectEnd = 3600001; },
                    function (timing) { return timing.responseStart = 3600003; },
                    function (timing) { return timing.responseEnd = 3600030; },
                    function (timing) { return timing.loadEventEnd = 3600042; }];
                for (var i = 0; i < timingModifiers.length; i++) {
                    var timing = {};
                    timing.navigationStart = 1;
                    timing.connectEnd = 2;
                    timing.requestStart = 3;
                    timing.responseStart = 30;
                    timing.responseEnd = 42;
                    timing.loadEventEnd = 60;
                    // change perf timing value
                    timingModifiers[i](timing);
                    var timingSpy = _this.sandbox.stub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance, "getPerformanceTiming", function () {
                        return timing;
                    });
                    var actualLoggedMessage = "";
                    Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
                    var loggingSpy = _this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "warnToConsole", function (m) { return actualLoggedMessage = m; });
                    var telemetry = new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("name", "url", 0);
                    Assert.equal(false, telemetry.getIsValid());
                    var data = telemetry;
                    Assert.equal(undefined, data.perfTotal);
                    Assert.equal(undefined, data.networkConnect);
                    Assert.equal(undefined, data.sentRequest);
                    Assert.equal(undefined, data.receivedResponse);
                    Assert.equal(undefined, data.domProcessing);
                    if (i === 0) {
                        // check props only for the first timingModifier
                        Assert.equal("AI (Internal): InvalidDurationValue message:\"Invalid page load duration value. Browser perf data won't be sent.\" props:\"{total:3600000,network:1,request:27,response:12,dom:3599959}\"", actualLoggedMessage);
                    }
                    else {
                        Assert.ok(actualLoggedMessage.lastIndexOf("AI (Internal): InvalidDurationValue message:\"Invalid page load duration value. Browser perf data won't be sent.", 0) === 0);
                    }
                    timingSpy.restore();
                    loggingSpy.restore();
                }
            }
        });
    };
    return PageViewPerformanceTelemetryTests;
}(ContractTestHelper));
new PageViewPerformanceTelemetryTests().registerTests();
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../testframework/contracttesthelper.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/pageview.ts" />
var PageViewTelemetryTests = (function (_super) {
    __extends(PageViewTelemetryTests, _super);
    function PageViewTelemetryTests() {
        _super.call(this, function () { return new Microsoft.ApplicationInsights.Telemetry.PageView("name", "url", 0); }, "PageViewTelemetryTests");
    }
    PageViewTelemetryTests.prototype.registerTests = function () {
        var _this = this;
        _super.prototype.registerTests.call(this);
        var name = this.name + ": ";
        var testValues = {
            name: "name",
            url: "url",
            duration: 1000,
            properties: {
                "property1": 5,
                "property2": 10
            },
            measurements: {
                "measurement": 300
            }
        };
        this.testCase({
            name: name + "PageviewData is initialized in constructor with 5 parameters (name, url, durationMs, properties, measurements) and valid",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.PageView(testValues.name, testValues.url, testValues.duration, testValues.properties, testValues.measurements);
                Assert.equal(testValues.name, telemetry.name);
                Assert.equal(testValues.url, telemetry.url);
                Assert.equal(Microsoft.ApplicationInsights.Util.msToTimeSpan(testValues.duration), telemetry.duration);
                Assert.deepEqual(testValues.properties, telemetry.properties);
                Assert.deepEqual(testValues.measurements, telemetry.measurements);
                _this.checkSerializableObject(function () { return telemetry; }, "PageviewData");
            }
        });
    };
    return PageViewTelemetryTests;
}(ContractTestHelper));
new PageViewTelemetryTests().registerTests();
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../testframework/contracttesthelper.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/trace.ts" />
var TraceTelemetryTests = (function (_super) {
    __extends(TraceTelemetryTests, _super);
    function TraceTelemetryTests() {
        _super.call(this, function () { return new Microsoft.ApplicationInsights.Telemetry.Trace("test"); }, "TraceTelemetryTests");
    }
    TraceTelemetryTests.prototype.registerTests = function () {
        _super.prototype.registerTests.call(this);
        var name = this.name + ": ";
        this.testCase({
            name: name + "Trace captures required data from user",
            test: function () {
                var message = "test";
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.Trace(message);
                Assert.equal(message, telemetry.message, "message is set correctly");
            }
        });
    };
    return TraceTelemetryTests;
}(ContractTestHelper));
new TraceTelemetryTests().registerTests();
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../testframework/contracttesthelper.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/RemoteDependencyData.ts" />
/// <reference path="../../../JavaScriptSDK.Interfaces/Contracts/Generated/SeverityLevel.ts" />
var RemoteDependencyTests = (function (_super) {
    __extends(RemoteDependencyTests, _super);
    function RemoteDependencyTests() {
        _super.call(this, function () { return new Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData(RemoteDependencyTests.id, RemoteDependencyTests.name, RemoteDependencyTests.url, RemoteDependencyTests.totalTime, RemoteDependencyTests.success, RemoteDependencyTests.resultCode, RemoteDependencyTests.method); }, "RemoteDependencyTelemetryTests");
    }
    RemoteDependencyTests.prototype.registerTests = function () {
        _super.prototype.registerTests.call(this);
        var name = this.name + ": ";
        this.testCase({
            name: name + "Constructor parameters are set correctly",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData(RemoteDependencyTests.id, RemoteDependencyTests.url, RemoteDependencyTests.name, RemoteDependencyTests.totalTime, RemoteDependencyTests.success, RemoteDependencyTests.resultCode, RemoteDependencyTests.method);
                Assert.equal("00:00:00.123", telemetry.duration, "value should be set correctly");
                Assert.equal(RemoteDependencyTests.success, telemetry.success, "success should be set correctly");
                Assert.equal(RemoteDependencyTests.resultCode, telemetry.resultCode, "resultCode should be set correctly");
                Assert.equal("GET /", telemetry.name, "name gets correct value");
                Assert.equal(RemoteDependencyTests.hostName, telemetry.target, "target gets correct value");
                Assert.equal(RemoteDependencyTests.name, telemetry.data, "data should be set correctly");
            }
        });
        this.testCase({
            name: name + "Data is truncated if too long",
            test: function () {
                var urlLength = 2049;
                var longUrl = "";
                for (var i = 0; i < urlLength; i++) {
                    longUrl += "A";
                }
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData(RemoteDependencyTests.id, longUrl, longUrl, RemoteDependencyTests.totalTime, RemoteDependencyTests.success, RemoteDependencyTests.resultCode, RemoteDependencyTests.method);
                Assert.equal(2048, telemetry.data.length, "data should be truncated");
            }
        });
        this.testCase({
            name: name + "name is truncated if too long",
            test: function () {
                var urlLength = 1025;
                var longUrl = "";
                for (var i = 0; i < urlLength; i++) {
                    longUrl += "A";
                }
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData(RemoteDependencyTests.id, longUrl, longUrl, RemoteDependencyTests.totalTime, RemoteDependencyTests.success, RemoteDependencyTests.resultCode, RemoteDependencyTests.method);
                Assert.equal(1024, telemetry.name.length, "name should be truncated");
            }
        });
        this.testCase({
            name: name + "Duration field is populated as expected",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData(RemoteDependencyTests.id, RemoteDependencyTests.url, RemoteDependencyTests.name, 86400000, RemoteDependencyTests.success, RemoteDependencyTests.resultCode, RemoteDependencyTests.method);
                Assert.equal("1.00:00:00.000", telemetry.duration, "value should be set correctly");
                telemetry = new Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData(RemoteDependencyTests.id, RemoteDependencyTests.url, RemoteDependencyTests.name, 86400026, RemoteDependencyTests.success, RemoteDependencyTests.resultCode, RemoteDependencyTests.method);
                Assert.equal("1.00:00:00.026", telemetry.duration, "value should be set correctly");
            }
        });
        this.testCase({
            name: name + "default properties are set correctly",
            test: function () {
                var telemetry = new Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData("", "", "", 0, false, 0, null);
                Assert.equal("Ajax", telemetry.type, "dependencyTypeName gets correct default value");
                Assert.equal("", telemetry.name, "name gets correct default value");
            }
        });
    };
    RemoteDependencyTests.id = "someid";
    RemoteDependencyTests.method = "GET";
    RemoteDependencyTests.name = "testName";
    RemoteDependencyTests.url = "http://myurl.com/";
    RemoteDependencyTests.hostName = "myurl.com";
    RemoteDependencyTests.totalTime = 123;
    RemoteDependencyTests.success = false;
    RemoteDependencyTests.resultCode = 404;
    return RemoteDependencyTests;
}(ContractTestHelper));
new RemoteDependencyTests().registerTests();
/// <reference path="../../testframework/common.ts" />
/// <reference path="../../../JavaScriptSDK/telemetry/Common/DataSanitizer.ts" />
/// <reference path="../../../JavaScriptSDK/Util.ts"/>
var DataSanitizerTests = (function (_super) {
    __extends(DataSanitizerTests, _super);
    function DataSanitizerTests() {
        _super.apply(this, arguments);
    }
    DataSanitizerTests.prototype.testInitialize = function () {
        this.origMaxNameLength = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_NAME_LENGTH"];
        this.origMaxStringLength = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_STRING_LENGTH"];
        this.origMaxUrlLength = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_URL_LENGTH"];
        this.origMaxMessageLength = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_MESSAGE_LENGTH"];
        this.origMaxExceptionLength = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_EXCEPTION_LENGTH"];
    };
    DataSanitizerTests.prototype.testCleanup = function () {
        Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_NAME_LENGTH"] = this.origMaxNameLength;
        Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_STRING_LENGTH"] = this.origMaxStringLength;
        Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_URL_LENGTH"] = this.origMaxUrlLength;
        Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_MESSAGE_LENGTH"] = this.origMaxMessageLength;
        Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_EXCEPTION_LENGTH"] = this.origMaxExceptionLength;
    };
    DataSanitizerTests.prototype.registerTests = function () {
        this.testCase({
            name: "DataSanitizerTests: Validate key with leading and trailing spaces is trimmed",
            test: function () {
                var expectedName = "Hello World";
                var name = "    \t\r\n" + expectedName + "\r\n\t     ";
                var validatedName = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeKey(name);
                Assert.equal(expectedName, validatedName);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate key is truncated after max length",
            test: function () {
                Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_NAME_LENGTH"] = 5;
                var expectedName = "Hello";
                var name = "HelloWorld";
                var validatedName = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeKey(name);
                Assert.equal(expectedName, validatedName);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate string is truncated after max length ",
            test: function () {
                Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_STRING_LENGTH"] = 5;
                var expectedValue = "Hello";
                var value = "HelloWorld";
                var validatedValue = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeString(value);
                Assert.equal(expectedValue, validatedValue);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate object.toString is truncated if object passed to sanitizeString",
            test: function () {
                Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_STRING_LENGTH"] = 5;
                var expectedValue = "[obje";
                var value = { greeting: "Hello", place: "World" };
                var validatedValue = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeString(value);
                Assert.equal(expectedValue, validatedValue);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate url is truncated after max length ",
            test: function () {
                Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_URL_LENGTH"] = 5;
                var expectedUrl = "Hello";
                var url = "HelloWorld";
                var validatedUrl = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeUrl(url);
                Assert.equal(expectedUrl, validatedUrl);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate message is truncated after max length ",
            test: function () {
                Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_MESSAGE_LENGTH"] = 5;
                var expectedMessage = "Hello";
                var message = "HelloWorld";
                var validatedMessage = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeMessage(message);
                Assert.equal(expectedMessage, validatedMessage);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate exception is truncated after max length ",
            test: function () {
                Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_EXCEPTION_LENGTH"] = 5;
                var expectedException = "Hello";
                var exception = "HelloWorld";
                var validatedException = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeException(exception);
                Assert.equal(expectedException, validatedException);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate measurement map is truncated after max length and maintains uniqueness",
            test: function () {
                Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer["MAX_NAME_LENGTH"] = 5;
                var map = {
                    "hello1": 1,
                    "hello2": 2,
                    "hello3": 3,
                    "hello4": 4,
                    "hello5": 5
                };
                var expectedMap = {
                    "hello": 1,
                    "he001": 2,
                    "he002": 3,
                    "he003": 4,
                    "he004": 5
                };
                var validatedMap = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeMeasurements(map);
                Assert.deepEqual(expectedMap, validatedMap);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate sanitizeString trims whitespaces",
            test: function () {
                var expected = "NoWhiteSpaces";
                var input = "   NoWhiteSpaces  ";
                var actual = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeString(input);
                Assert.equal(expected, actual);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate sanitizeProperties trims whitespaces in properties names and values",
            test: function () {
                var expected = "NoWhiteSpaces";
                var input = "   NoWhiteSpaces  ";
                var testProps = { "  prop1  ": "   val  ", "   prop2 ": " val     " };
                var actual = Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeProperties(testProps);
                Assert.equal("val", actual["prop1"]);
                Assert.equal("val", actual["prop2"]);
            }
        });
        this.testCase({
            name: "DataSanitizerTests: Validate sanitizeString handles null and undefined",
            test: function () {
                Assert.ok(null === Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeString(null));
                Assert.ok(undefined === Microsoft.ApplicationInsights.Telemetry.Common.DataSanitizer.sanitizeString(undefined));
            }
        });
    };
    return DataSanitizerTests;
}(TestClass));
new DataSanitizerTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/Telemetry/PageVisitTimeManager.ts" />
var PageVisitTimeManagerTests = (function (_super) {
    __extends(PageVisitTimeManagerTests, _super);
    function PageVisitTimeManagerTests() {
        _super.apply(this, arguments);
    }
    /** Method called before the start of each test method */
    PageVisitTimeManagerTests.prototype.testInitialize = function () {
        var storage = this.getMockStorage();
        this.getStorageObjectStub = this.sandbox.stub(Microsoft.ApplicationInsights.Util, "_getSessionStorageObject", function () { return storage; });
        this.throwInternal = this.sandbox.spy(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
    };
    PageVisitTimeManagerTests.prototype.registerTests = function () {
        var _this = this;
        var testValues = {
            page1Name: "page1",
            page1Url: "page1Url",
            page1ViewTime: 10,
            page2Name: "page2",
            page2Url: "page2Url",
            page2ViewTime: 20,
            page3Name: "page3",
            page3Url: "page3Url",
            page3ViewTime: 30
        };
        this.testCase({
            name: "PageVisitTimeManager: When trackPreviousPageVisit is called once, the tracking delegate is not called since there are no previous pages",
            test: function () {
                //setup
                var object = { method: function () { } };
                var spy = _this.sandbox.spy(object, "method");
                var pageVisitTimeManager = new Microsoft.ApplicationInsights.Telemetry.PageVisitTimeManager(spy);
                //act
                pageVisitTimeManager.trackPreviousPageVisit(testValues.page1Name, testValues.page1Url);
                _this.clock.tick(testValues.page1ViewTime);
                // verify
                Assert.ok(spy.notCalled, "telemetry wasn't sent");
            }
        });
        this.testCase({
            name: "PageVisitTimeManager: When trackPreviousPageVisit is called twice, the tracking delegate is called once with correct details",
            test: function () {
                //setup
                var object = { method: function () { } };
                var spy = _this.sandbox.spy(object, "method");
                var pageVisitTimeManager = new Microsoft.ApplicationInsights.Telemetry.PageVisitTimeManager(spy);
                //act
                pageVisitTimeManager.trackPreviousPageVisit(testValues.page1Name, testValues.page1Url);
                _this.clock.tick(testValues.page1ViewTime);
                pageVisitTimeManager.trackPreviousPageVisit(testValues.page2Name, testValues.page2Url);
                // verify
                Assert.ok(spy.calledOnce, "telemetry sent once");
                Assert.ok(spy.calledWith(testValues.page1Name, testValues.page1Url, testValues.page1ViewTime));
            }
        });
        this.testCase({
            name: "PageVisitTimeManager: consecutive calls to start and stop returns expected information",
            test: function () {
                //setup
                var pageVisitTimeManager = new Microsoft.ApplicationInsights.Telemetry.PageVisitTimeManager(function () { });
                //act
                pageVisitTimeManager.startPageVisitTimer(testValues.page1Name, testValues.page1Url);
                _this.clock.tick(testValues.page1ViewTime);
                var page1VisitData = pageVisitTimeManager.stopPageVisitTimer();
                //verify
                Assert.equal(testValues.page1Name, page1VisitData.pageName);
                Assert.equal(testValues.page1Url, page1VisitData.pageUrl);
                Assert.equal(testValues.page1ViewTime, page1VisitData.pageVisitTime);
            }
        });
        this.testCase({
            name: "PageVisitTimeManager: first call to restart returns null",
            test: function () {
                //setup
                var pageVisitTimeManager = new Microsoft.ApplicationInsights.Telemetry.PageVisitTimeManager(function () { });
                //act
                var nullPageData = pageVisitTimeManager.restartPageVisitTimer(testValues.page1Name, testValues.page1Url);
                //verify
                Assert.equal(null, nullPageData);
            }
        });
        this.testCase({
            name: "PageVisitTimeManager: consecutive calls to restart returns expected information",
            test: function () {
                //setup
                var pageVisitTimeManager = new Microsoft.ApplicationInsights.Telemetry.PageVisitTimeManager(function () { });
                //act
                pageVisitTimeManager.restartPageVisitTimer(testValues.page1Name, testValues.page1Url);
                _this.clock.tick(testValues.page1ViewTime);
                var page1VisitData = pageVisitTimeManager.restartPageVisitTimer(testValues.page2Name, testValues.page2Url);
                //verify
                Assert.equal(testValues.page1Name, page1VisitData.pageName);
                Assert.equal(testValues.page1Url, page1VisitData.pageUrl);
                Assert.equal(testValues.page1ViewTime, page1VisitData.pageVisitTime);
            }
        });
        this.testCase({
            name: "PageVisitTimeManager: stopPageVisitTimer returns null if start has not been called",
            test: function () {
                //setup
                // Mock storage so this will work in all browsers for tests
                var pageVisitTimeManager = new Microsoft.ApplicationInsights.Telemetry.PageVisitTimeManager(function () { });
                //act
                var retval = pageVisitTimeManager.stopPageVisitTimer();
                Assert.equal(null, retval);
            }
        });
        this.testCase({
            name: "PageVisitTimeManager: startPageVisitTime fails silently if called twice without a call to stop",
            test: function () {
                //setup
                var pageVisitTimeManager = new Microsoft.ApplicationInsights.Telemetry.PageVisitTimeManager(function () { });
                //act
                try {
                    pageVisitTimeManager.startPageVisitTimer(testValues.page1Name, testValues.page1Url);
                    pageVisitTimeManager.startPageVisitTimer(testValues.page1Name, testValues.page1Url);
                    Assert.ok(true);
                }
                catch (e) {
                    Assert.ok(false);
                }
            }
        });
    };
    PageVisitTimeManagerTests.prototype.getMockStorage = function () {
        var storage = {};
        storage.getItem = function (name) { return storage[name]; };
        storage.setItem = function (name, value) { return (storage[name] = value); };
        storage.removeItem = function (name, value) { return (storage[name] = undefined); };
        return storage;
    };
    return PageVisitTimeManagerTests;
}(TestClass));
new PageVisitTimeManagerTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/logging.ts" />
/// <reference path="../../javascriptsdk/appinsights.ts" />
var LoggingTests = (function (_super) {
    __extends(LoggingTests, _super);
    function LoggingTests() {
        _super.apply(this, arguments);
        this.InternalLogging = Microsoft.ApplicationInsights._InternalLogging;
        this.InternalLoggingMessage = Microsoft.ApplicationInsights._InternalLogMessage;
        this.enableDebugExceptionsDefaultValue = Microsoft.ApplicationInsights._InternalLogging.enableDebugExceptions();
        this.verboseLoggingDefaultValue = Microsoft.ApplicationInsights._InternalLogging.verboseLogging();
    }
    LoggingTests.prototype.testInitialize = function () {
        this.InternalLogging.setMaxInternalMessageLimit(Number.MAX_VALUE);
    };
    LoggingTests.prototype.testCleanup = function () {
        var _this = this;
        // Clear the queue
        this.clearInternalLoggingQueue();
        // Reset the internal event throttle
        this.InternalLogging.resetInternalMessageCount();
        // Reset the internal throttle max limit
        this.InternalLogging.setMaxInternalMessageLimit(Number.MAX_VALUE);
        // Clear records indicating what internal message types were already logged
        this.InternalLogging.clearInternalMessageLoggedTypes();
        // Reset to a default state
        this.InternalLogging.enableDebugExceptions = function () { return _this.enableDebugExceptionsDefaultValue; };
        this.InternalLogging.verboseLogging = function () { return _this.verboseLoggingDefaultValue; };
    };
    /**
     * Clears the internal logging queue
     */
    LoggingTests.prototype.clearInternalLoggingQueue = function () {
        var length = this.InternalLogging.queue.length;
        for (var i = 0; i < length; i++) {
            this.InternalLogging.queue.shift();
        }
    };
    LoggingTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "LoggingTests: enableDebugExceptions enables exceptions",
            test: function () {
                // setup
                var throwSpy = null;
                try {
                    throwSpy = _this.sandbox.spy(console, "warn");
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies \n" + e.toString());
                }
                var i = 0;
                // verify
                Assert.ok(!_this.InternalLogging.enableDebugExceptions(), "enableDebugExceptions is false by default");
                // act
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, ++i, "error!", null, true);
                // verify
                Assert.ok(!throwSpy || throwSpy.calledOnce, "console.warn was called instead of throwing while enableDebugExceptions is false");
                // act
                _this.InternalLogging.enableDebugExceptions = function () { return true; };
                // verify
                Assert.throws(function () {
                    return _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, ++i, "error!", null, true);
                }, "error is thrown when enableDebugExceptions is true");
                Assert.ok(!throwSpy || throwSpy.calledOnce, "console.warn was not called when the error was thrown");
            }
        });
        this.testCase({
            name: "LoggingTests: verboseLogging collects all logs",
            test: function () {
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                _this.InternalLogging.verboseLogging = function () { return true; };
                var i = 2;
                // act
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.WARNING, ++i, "error!");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.WARNING, ++i, "error!", null, true);
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, ++i, "error!");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, ++i, "error!", null, true);
                //verify
                Assert.equal(4, _this.InternalLogging.queue.length);
                Assert.equal("AI (Internal): " + "BrowserCannotWriteLocalStorage message:\"error!\"", _this.InternalLogging.queue[0].message);
                Assert.equal("AI: " + "BrowserCannotWriteSessionStorage message:\"error!\"", _this.InternalLogging.queue[1].message);
                Assert.equal("AI (Internal): " + "BrowserFailedRemovalFromLocalStorage message:\"error!\"", _this.InternalLogging.queue[2].message);
                Assert.equal("AI: " + "BrowserFailedRemovalFromSessionStorage message:\"error!\"", _this.InternalLogging.queue[3].message);
            }
        });
        this.testCase({
            name: "LoggingTests: Logging only collects CRITICAL logs by default",
            test: function () {
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                var i = 0;
                // act
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.WARNING, ++i, "error!");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.WARNING, ++i, "error!", null, true);
                Assert.equal(0, _this.InternalLogging.queue.length);
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, ++i, "error!");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, ++i, "error!", null, true);
                //verify
                Assert.equal(2, _this.InternalLogging.queue.length);
                Assert.equal("AI (Internal): " + "BrowserCannotWriteLocalStorage message:\"error!\"", _this.InternalLogging.queue[0].message);
                Assert.equal("AI: " + "BrowserCannotWriteSessionStorage message:\"error!\"", _this.InternalLogging.queue[1].message);
            }
        });
        this.testCase({
            name: "LoggingTests: throwInternal adds to the queue and calls console.warn",
            test: function () {
                // setup
                var throwSpy = null;
                try {
                    throwSpy = _this.sandbox.spy(console, "warn");
                    // act
                    _this.InternalLogging.enableDebugExceptions = function () { return false; };
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!", null, true);
                    // verify
                    Assert.ok(throwSpy.calledOnce, "console.warn was not called while debug mode was false");
                    Assert.equal(1, _this.InternalLogging.queue.length);
                    Assert.equal("AI: " + "BrowserCannotReadLocalStorage message:\"error!\"", _this.InternalLogging.queue[0].message);
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies on window objects\n" + e.toString());
                }
            }
        });
        this.testCase({
            name: "LoggingTests: throwInternal adds to the queue and calls console.warn",
            test: function () {
                // setup
                var throwSpy = null;
                try {
                    throwSpy = _this.sandbox.spy(console, "warn");
                    // act
                    _this.InternalLogging.enableDebugExceptions = function () { return false; };
                    _this.InternalLogging.verboseLogging = function () { return true; };
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!");
                    // verify
                    Assert.ok(throwSpy.calledOnce, "console.warn was not called while debug mode was false");
                    Assert.equal(1, _this.InternalLogging.queue.length);
                    Assert.equal("AI (Internal): " + "BrowserCannotReadLocalStorage message:\"error!\"", _this.InternalLogging.queue[0].message);
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies on window objects\n" + e.toString());
                }
            }
        });
        this.testCase({
            name: "LoggingTests: throwInternal does not call console.warn without verboseLogging",
            test: function () {
                // setup
                var throwSpy = null;
                try {
                    throwSpy = _this.sandbox.spy(console, "warn");
                    // act
                    _this.InternalLogging.enableDebugExceptions = function () { return false; };
                    _this.InternalLogging.verboseLogging = function () { return false; };
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!");
                    // verify
                    Assert.ok(throwSpy.notCalled, "console.warn was called while verboseLogging mode was false");
                    Assert.equal(1, _this.InternalLogging.queue.length);
                    Assert.equal("AI (Internal): " + "BrowserCannotReadLocalStorage message:\"error!\"", _this.InternalLogging.queue[0].message);
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies on window objects\n" + e.toString());
                }
            }
        });
        this.testCase({
            name: "LoggingTests: throwInternal (userActionable) logs only one message of a given type to console (without verboseLogging)",
            test: function () {
                // setup
                var throwSpy = null;
                try {
                    throwSpy = _this.sandbox.spy(console, "warn");
                    _this.InternalLogging.enableDebugExceptions = function () { return false; };
                    _this.InternalLogging.verboseLogging = function () { return false; };
                    // act
                    // send 4 messages, with 2 distinct types
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!", null, true);
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 2, "error 2!", null, true);
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!", null, true);
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 2, "error 2!", null, true);
                    // verify
                    Assert.ok(throwSpy.calledTwice, "console.warn was called only once per each message type");
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies on window objects\n" + e.toString());
                }
            }
        });
        this.testCase({
            name: "LoggingTests: throwInternal (userActionable) always log to console with verbose logging",
            test: function () {
                // setup
                var throwSpy = null;
                try {
                    throwSpy = _this.sandbox.spy(console, "warn");
                    _this.InternalLogging.enableDebugExceptions = function () { return false; };
                    _this.InternalLogging.verboseLogging = function () { return true; };
                    // act
                    // send 4 messages, with 2 distinct types
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!", null, true);
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 2, "error 2!", null, true);
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!", null, true);
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 2, "error 2!", null, true);
                    // verify
                    Assert.equal(4, throwSpy.callCount, "console.warn was called for each message");
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies on window objects\n" + e.toString());
                }
            }
        });
        this.testCase({
            name: "LoggingTests: warnToConsole does not add to the queue ",
            test: function () {
                // setup
                var throwSpy = null;
                try {
                    throwSpy = _this.sandbox.spy(console, "warn");
                    // act
                    var message = "error!";
                    _this.InternalLogging.warnToConsole(message);
                    // verify
                    Assert.ok(throwSpy.calledOnce, "console.warn was called once");
                    Assert.equal(0, _this.InternalLogging.queue.length);
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies on window objects\n" + e.toString());
                }
            }
        });
        this.testCase({
            name: "LoggingTests: console.warn falls back to console.log",
            test: function () {
                // setup
                var throwSpy = null;
                var warn = console.warn;
                try {
                    console.warn = undefined;
                    throwSpy = _this.sandbox.spy(console, "log");
                    // act
                    _this.InternalLogging.enableDebugExceptions = function () { return false; };
                    _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "error!", null, true);
                    // verify
                    Assert.ok(throwSpy.calledOnce, "console.log was called when console.warn was not present");
                }
                catch (e) {
                    Assert.ok(true, "IE8 breaks sinon spies on window objects\n" + e.toString());
                }
                finally {
                    console.warn = warn;
                }
            }
        });
        this.testCase({
            name: "LoggingTests: logInternalMessage throttles messages when the throttle limit is reached",
            test: function () {
                var maxAllowedInternalMessages = 2;
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                _this.InternalLogging.setMaxInternalMessageLimit(maxAllowedInternalMessages);
                _this.InternalLogging.resetInternalMessageCount();
                // act
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadLocalStorage, "");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadSessionStorage, "");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotWriteLocalStorage, "");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotWriteSessionStorage, "");
                // verify
                Assert.equal(maxAllowedInternalMessages + 1, _this.InternalLogging.queue.length); // Since we always send one "extra" event to denote that limit was reached
                Assert.equal(_this.InternalLogging.queue[0].message, "AI (Internal): BrowserCannotReadLocalStorage");
                Assert.equal(_this.InternalLogging.queue[1].message, "AI (Internal): BrowserCannotReadSessionStorage");
                Assert.equal(_this.InternalLogging.queue[2].message, "AI (Internal): MessageLimitPerPVExceeded message:\"Internal events throttle limit per PageView reached for this app.\"");
            }
        });
        this.testCase({
            name: "LoggingTests: throwInternal should call logInternalMessage",
            test: function () {
                var maxAllowedInternalMessages = 2;
                var logInternalMessageStub = _this.sandbox.stub(_this.InternalLogging, 'logInternalMessage');
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                _this.InternalLogging.resetInternalMessageCount();
                // act
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, 1, "");
                // verify
                Assert.ok(logInternalMessageStub.calledOnce, 'logInternalMessage was not called by throwInternal');
            }
        });
        this.testCase({
            name: "LoggingTests: only single message of specific type can be sent within the same session",
            test: function () {
                var maxAllowedInternalMessages = 2;
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                _this.InternalLogging.resetInternalMessageCount();
                _this.InternalLogging.clearInternalMessageLoggedTypes();
                var id1 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadLocalStorage;
                var id2 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadSessionStorage;
                // act
                // send 4 messages, with 2 distinct types
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id1, "1");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id2, "2");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id1, "1");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id2, "2");
                // verify
                // only two messages should be in the queue, because we have to distinct types
                Assert.equal(2, _this.InternalLogging.queue.length);
                Assert.equal(_this.InternalLogging.queue[0].message, "AI (Internal): BrowserCannotReadLocalStorage message:\"1\"");
                Assert.equal(_this.InternalLogging.queue[1].message, "AI (Internal): BrowserCannotReadSessionStorage message:\"2\"");
            }
        });
        this.testCase({
            name: "LoggingTests: only single message of specific type can be sent within the same page view when session storage is not available",
            test: function () {
                var maxAllowedInternalMessages = 2;
                var id1 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadLocalStorage;
                var id2 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadSessionStorage;
                // disable session storage
                var utilCanUseSession = Microsoft.ApplicationInsights.Util.canUseSessionStorage;
                Microsoft.ApplicationInsights.Util.canUseSessionStorage = function () {
                    return false;
                };
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                _this.InternalLogging.resetInternalMessageCount();
                _this.InternalLogging.clearInternalMessageLoggedTypes();
                // act
                // send 4 messages, with 2 distinct types
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id1, "1");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id2, "2");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id1, "1");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id2, "2");
                // verify
                // only two messages should be in the queue, because we have to distinct types
                Assert.equal(2, _this.InternalLogging.queue.length);
                Assert.equal(_this.InternalLogging.queue[0].message, "AI (Internal): BrowserCannotReadLocalStorage message:\"1\"");
                Assert.equal(_this.InternalLogging.queue[1].message, "AI (Internal): BrowserCannotReadSessionStorage message:\"2\"");
                // clean up - reset session storage
                Microsoft.ApplicationInsights.Util.canUseSessionStorage = utilCanUseSession;
            }
        });
        this.testCase({
            name: "LoggingTests: throwInternal (user actionable) should call logInternalMessage",
            test: function () {
                var maxAllowedInternalMessages = 2;
                var logInternalMessageStub = _this.sandbox.stub(_this.InternalLogging, 'logInternalMessage');
                var id1 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadLocalStorage;
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                _this.InternalLogging.resetInternalMessageCount();
                // act
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id1, "Internal Test Event", null, true);
                // verify
                Assert.ok(logInternalMessageStub.calledOnce, 'logInternalMessage was not called by throwInternal');
            }
        });
        this.testCase({
            name: "LoggingTests: logInternalMessage will log events when the throttle is reset",
            test: function () {
                var maxAllowedInternalMessages = 2;
                var id1 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadLocalStorage;
                var id2 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotReadSessionStorage;
                var id3 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotWriteLocalStorage;
                var id4 = Microsoft.ApplicationInsights._InternalMessageId.BrowserCannotWriteSessionStorage;
                // setup
                _this.InternalLogging.enableDebugExceptions = function () { return false; };
                _this.InternalLogging.setMaxInternalMessageLimit(maxAllowedInternalMessages);
                _this.InternalLogging.resetInternalMessageCount();
                _this.InternalLogging.clearInternalMessageLoggedTypes();
                // act
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id1, "1");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id2, "2", null, true);
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id3, "3");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id4, "4", null, true);
                // verify that internal events are throttled
                Assert.equal(_this.InternalLogging.queue.length, maxAllowedInternalMessages + 1); // Since we always send one "extra" event to denote that limit was reached
                // act again
                _this.clearInternalLoggingQueue();
                // reset the message count
                _this.InternalLogging.resetInternalMessageCount();
                _this.InternalLogging.clearInternalMessageLoggedTypes();
                // Send some internal messages
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id1, "1");
                _this.InternalLogging.throwInternal(Microsoft.ApplicationInsights.LoggingSeverity.CRITICAL, id2, "2");
                // verify again
                Assert.equal(_this.InternalLogging.queue.length, maxAllowedInternalMessages + 1); // Since we always send one "extra" event to denote that limit was reached
                Assert.equal(_this.InternalLogging.queue[0].message, "AI (Internal): BrowserCannotReadLocalStorage message:\"1\"");
                Assert.equal(_this.InternalLogging.queue[1].message, "AI (Internal): BrowserCannotReadSessionStorage message:\"2\"");
            }
        });
    };
    return LoggingTests;
}(TestClass));
new LoggingTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/Util.ts"/>
/// <reference path="../../JavaScriptSDK/sender.ts" />
/// <reference path="../../JavaScriptSDK/SendBuffer.ts"/>
/// <reference path="../../javascriptsdk/appinsights.ts" />
/// <reference path="../../JavaScriptSDK/util.ts" />
var SenderWrapper = (function (_super) {
    __extends(SenderWrapper, _super);
    function SenderWrapper() {
        _super.apply(this, arguments);
    }
    return SenderWrapper;
}(Microsoft.ApplicationInsights.Sender));
var SenderTests = (function (_super) {
    __extends(SenderTests, _super);
    function SenderTests() {
        _super.apply(this, arguments);
    }
    SenderTests.prototype.testInitialize = function () {
        var _this = this;
        if (Microsoft.ApplicationInsights.Util.canUseSessionStorage()) {
            sessionStorage.clear();
        }
        this.requests = [];
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.xdr = sinon.useFakeXMLHttpRequest();
        this.fakeServer = sinon.fakeServer.create();
        this.endpointUrl = "testUrl";
        this.maxBatchSizeInBytes = 1000000;
        this.maxBatchInterval = 1;
        this.disableTelemetry = false;
        var config = this.getDefaultConfig();
        this.getSender = function () {
            var sender = new Microsoft.ApplicationInsights.Sender(config);
            sender.errorSpy = _this.sandbox.spy(sender, "_onError");
            sender.successSpy = _this.sandbox.spy(sender, "_onSuccess");
            sender.partialSpy = _this.sandbox.spy(sender, "_onPartialSuccess");
            return sender;
        };
        this.loggingSpy = this.sandbox.stub(Microsoft.ApplicationInsights._InternalLogging, "warnToConsole");
        this.testTelemetry = { aiDataContract: true };
        Microsoft.ApplicationInsights._InternalLogging.verboseLogging = function () { return true; };
    };
    SenderTests.prototype.testCleanup = function () {
        // reset enableDebugger to a default value
        Microsoft.ApplicationInsights._InternalLogging.enableDebugExceptions = function () { return false; };
        this.loggingSpy.reset();
        // clear session storage buffers
        Microsoft.ApplicationInsights.Util.setSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.BUFFER_KEY, null);
        Microsoft.ApplicationInsights.Util.setSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.SENT_BUFFER_KEY, null);
    };
    SenderTests.prototype.requestAsserts = function () {
        Assert.ok(this.fakeServer.requests.length > 0, "request was sent");
        var method = this.fakeServer.getHTTPMethod(this.fakeServer.requests[0]);
        Assert.equal("POST", method, "requets method is 'POST'");
    };
    ;
    SenderTests.prototype.logAsserts = function (expectedCount) {
        var isValidCallCount = this.loggingSpy.callCount === expectedCount;
        Assert.ok(isValidCallCount, "logging spy was called " + expectedCount + " time(s)");
        if (!isValidCallCount) {
            for (var i = 0; i < this.loggingSpy.args.length; i++) {
                Assert.ok(false, "[warning thrown]: " + this.loggingSpy.args[i]);
            }
        }
    };
    SenderTests.prototype.successAsserts = function (sender) {
        Assert.ok(sender.successSpy.called, "success was invoked");
        Assert.ok(sender.errorSpy.notCalled, "no error");
    };
    SenderTests.prototype.errorAsserts = function (sender) {
        Assert.ok(sender.errorSpy.called, "error was invoked");
        Assert.ok(sender.successSpy.notCalled, "success was not invoked");
    };
    SenderTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "SenderTests: uninitialized sender throws a warning when invoked",
            test: function () {
                // setup
                XMLHttpRequest = undefined;
                var sender = _this.getSender();
                // act
                sender.send(_this.testTelemetry);
                // verify
                Assert.ok(sender.successSpy.notCalled, "success handler was not invoked");
                Assert.ok(sender.errorSpy.notCalled, "error handler was not invoked");
                _this.logAsserts(1);
            }
        });
        this.testCase({
            name: "SenderTests: sender throws when no arg is passed",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                // act
                var sender = _this.getSender();
                sender.send(undefined);
                // verify
                Assert.ok(sender.successSpy.notCalled, "success handler was not invoked");
                Assert.ok(sender.errorSpy.notCalled, "error handler was not invoked");
                _this.logAsserts(1);
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest sender can be invoked and handles errors",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                // act
                var sender = _this.getSender();
                // verify
                Assert.ok(sender, "sender was constructed");
                // act
                _this.fakeServer.requests.pop();
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                _this.requestAsserts();
                _this.fakeServer.requests.pop().respond(200, { "Content-Type": "application/json" }, '{"test":"success"}"');
                _this.successAsserts(sender);
                _this.logAsserts(0);
                sender.successSpy.reset();
                sender.errorSpy.reset();
                // act
                _this.fakeServer.requests.pop();
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                _this.requestAsserts();
                _this.fakeServer.requests.pop().respond(404, { "Content-Type": "application/json" }, '{"test":"not found"}"');
                _this.errorAsserts(sender);
                _this.logAsserts(1);
                sender.successSpy.reset();
                sender.errorSpy.reset();
            }
        });
        this.testCase({
            name: "SenderTests: XDomain sender can be invoked and handles errors",
            test: function () {
                // setup
                // pretend that you are IE8/IE9 browser which supports XDomainRequests
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    delete xhr.withCredentials;
                    return xhr;
                });
                XDomainRequest = (function () {
                    var xdr = new _this.xhr;
                    xdr.onload = xdr.onreadystatechange;
                    xdr.responseText = 200;
                    return xdr;
                });
                // act
                var sender = _this.getSender();
                sender._config.endpointUrl = function () { return window.location.protocol + "//fakeEndpoint"; };
                // verify
                Assert.ok(sender, "sender was constructed");
                // act
                _this.fakeServer.requests.pop();
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                _this.requestAsserts();
                _this.fakeServer.requests[0].respond(200, { "Content-Type": "application/json" }, '200');
                _this.successAsserts(sender);
                _this.logAsserts(0);
                sender.successSpy.reset();
                sender.errorSpy.reset();
                // act
                _this.fakeServer.requests.pop();
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                _this.requestAsserts();
                _this.fakeServer.requests[0].respond(404, { "Content-Type": "application/json" }, '400');
                _this.errorAsserts(sender);
                _this.logAsserts(1);
                sender.successSpy.reset();
                sender.errorSpy.reset();
            }
        });
        this.testCase({
            name: "SenderTests: XDomain will drop the telemetry if the Endpoint protocol doesn't match the hosting page protocol",
            test: function () {
                // setup
                // pretend that you are IE8/IE9 browser which supports XDomainRequests
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    delete xhr.withCredentials;
                    return xhr;
                });
                XDomainRequest = (function () {
                    var xdr = new _this.xhr;
                    xdr.onload = xdr.onreadystatechange;
                    xdr.responseText = 206;
                    return xdr;
                });
                // act
                var config = _this.getDefaultConfig();
                config.endpointUrl = function () { return "fake://example.com"; };
                var sender = new Microsoft.ApplicationInsights.Sender(config);
                _this.fakeServer.requests.pop();
                sender.errorSpy = _this.sandbox.spy(sender, "_onError");
                sender.successSpy = _this.sandbox.spy(sender, "_onSuccess");
                sender.partialSpy = _this.sandbox.spy(sender, "_onPartialSuccess");
                Assert.equal(0, _this.fakeServer.requests.length, "request was not sent");
                Assert.ok(sender.errorSpy.notCalled, "error not called");
                Assert.ok(sender.successSpy.notCalled, "success not called");
                Assert.ok(sender.partialSpy.notCalled, "partial not called");
                Assert.equal(sender._buffer.count(), 0, "buffer should be empty");
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest and XDomainRequest native error handlers are logged",
            test: function () {
                // setup
                var xhr = new _this.xhr;
                XMLHttpRequest = (function () {
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                _this.clock.tick(sender._config.maxBatchInterval() + 1);
                sender.send(_this.testTelemetry);
                sender.triggerSend();
                xhr.onerror();
                // verify
                _this.errorAsserts(sender);
                sender.errorSpy.reset();
                // setup
                var xdr = new _this.xhr;
                XMLHttpRequest = (function () { });
                XDomainRequest = (function () {
                    xdr.onload = xdr.onreadystatechange;
                    xdr.responseText = 200;
                    return xdr;
                });
                sender = _this.getSender();
                _this.clock.tick(sender._config.maxBatchInterval() + 1);
                sender.send(_this.testTelemetry);
                sender.triggerSend();
                xdr.onerror();
                // verify
                _this.errorAsserts(sender);
                sender.errorSpy.reset();
            }
        });
        this.testCase({
            name: "SenderTests: sender invokes early when the buffer is full",
            test: function () {
                // setup
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                _this.maxBatchSizeInBytes = Microsoft.ApplicationInsights.Serializer.serialize(_this.testTelemetry).length;
                _this.maxBatchInterval = 1;
                _this.clock.now = 1;
                // act (this will fill the buffer and then overflow to send immediately)
                sender.send(_this.testTelemetry);
                sender.send(_this.testTelemetry);
                // verify
                Assert.ok(senderSpy.calledOnce, "sender was invoked");
                // act (make sure second message is sent after max interval is reached)
                senderSpy.reset();
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                Assert.ok(senderSpy.calledOnce, "sender was invoked a second time after maxInterval elapsed");
                _this.logAsserts(0);
                // act (make sure nothing more is sent when max interval is reached)
                senderSpy.reset();
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                Assert.ok(senderSpy.notCalled, "sender was not invoked a third time after maxInterval elapsed");
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: sender timeout is reset after each successful send",
            test: function () {
                // setup
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                _this.maxBatchSizeInBytes = Microsoft.ApplicationInsights.Serializer.serialize(_this.testTelemetry).length;
                _this.maxBatchInterval = 1;
                _this.clock.now = 1;
                // act (this will fill the buffer once, trigger a send, then refill and overflow)
                Microsoft.ApplicationInsights._InternalLogging.enableDebugExceptions = function () { return true; };
                sender.send(_this.testTelemetry);
                sender.send(_this.testTelemetry);
                // sender.send(this.testTelemetry); todo: send again here once throttling is re-enabled
                // verify
                Assert.ok(senderSpy.calledOnce, "sender was invoked");
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: sender throttles requests when buffer is filled twice before minInterval has ellapsed",
            test: function () {
                // setup
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                _this.maxBatchSizeInBytes = Microsoft.ApplicationInsights.Serializer.serialize(_this.testTelemetry).length * 2 + 3; // +3 for "[],"
                _this.maxBatchInterval = 2;
                // act
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                Assert.ok(senderSpy.calledTwice, "sender was invoked twice");
                _this.logAsserts(0);
                sender._buffer.clear();
                // act (fill buffer, trigger send, refill buffer, wait)
                _this.clock.tick(1);
                senderSpy.reset();
                sender.send(_this.testTelemetry);
                sender.send(_this.testTelemetry);
                sender.send(_this.testTelemetry);
                sender._buffer.clear();
                sender.send(_this.testTelemetry);
                sender.send(_this.testTelemetry);
                sender.send(_this.testTelemetry);
                // verify
                Assert.ok(senderSpy.calledTwice, "sender was invoked twice");
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: Verify default value of enableTracking is false",
            test: function () {
                // setup
                var sender = _this.getSender();
                // verify
                Assert.ok(!sender._config.disableTelemetry(), "default value for disable tracking is false");
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: enableTracking switch is set to false.  Sender should not send/save data",
            test: function () {
                // setup
                _this.disableTelemetry = true;
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                // act
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify
                Assert.ok(senderSpy.notCalled, "sender was not called");
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: enableTracking switch is set to false.  Trigger send should not send data",
            test: function () {
                // setup
                _this.disableTelemetry = true;
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                _this.maxBatchInterval = 100;
                // act
                sender.send(_this.testTelemetry);
                sender.triggerSend();
                // verify
                Assert.ok(senderSpy.notCalled, "sender was not called");
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: triggerSend should send event data asynchronously by default",
            test: function () {
                // setup
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                _this.maxBatchInterval = 100;
                // act
                sender.send(_this.testTelemetry);
                sender.triggerSend();
                // verify
                Assert.equal(true, senderSpy.getCall(0).args[1], "triggerSend should have called _send with async = true");
            }
        });
        this.testCase({
            name: "SenderTests: triggerSend should send event data synchronously when asked to.",
            test: function () {
                // setup
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                _this.maxBatchInterval = 100;
                // act
                sender.send(_this.testTelemetry);
                sender.triggerSend(false /* async */);
                // verify
                Assert.equal(false, senderSpy.getCall(0).args[1], "triggerSend should have called _send with async = false");
            }
        });
        this.testCase({
            name: "SenderTests: triggerSend should send event data asynchronously when asked to `explicitly`",
            test: function () {
                // setup
                var sender = _this.getSender();
                sender._sender = function () { return null; };
                var senderSpy = _this.sandbox.spy(sender, "_sender");
                _this.maxBatchInterval = 100;
                // act
                sender.send(_this.testTelemetry);
                sender.triggerSend(true /* async */);
                // verify
                Assert.equal(true, senderSpy.getCall(0).args[1], "triggerSend should have called _send with async = true");
            }
        });
        // TODO: move DataLossAnalyzer tests to a separate class
        /*this.testCase({
            name: "SenderTests: data loss analyzer - send(item), queued, sent; result 0",
            test: () => {
                // setup
                this.setupDataLossAnalyzer();
                var sender = this.getSender();
                this.fakeServer.requests.pop(); // xhr was created inside Sender's constructor, removing it to avoid confusion
                var senderSpy = this.sandbox.spy(sender, "_sender");

                // act
                sender.send(this.testTelemetry);
                sender.triggerSend();
                this.fakeServer.requests[0].respond(200, {}, "");

                // Validate
                Assert.equal(0, Microsoft.ApplicationInsights.DataLossAnalyzer.getNumberOfLostItems());
            }
        });

        this.testCase({
            name: "SenderTests: data loss analyzer - send(item), queued, send(item), queued, sent; result 0",
            test: () => {
                // setup
                this.setupDataLossAnalyzer();
                var sender = this.getSender();
                this.fakeServer.requests.pop(); // xhr was created inside Sender's constructor, removing it to avoid confusion
                var senderSpy = this.sandbox.spy(sender, "_sender");

                // act
                sender.send(this.testTelemetry);
                sender.send(this.testTelemetry);
                sender.triggerSend();
                this.fakeServer.requests[0].respond(200, {}, "");

                // Validate
                Assert.equal(0, Microsoft.ApplicationInsights.DataLossAnalyzer.getNumberOfLostItems());
            }
        });

        this.testCase({
            name: "SenderTests: data loss analyzer - send(item), queued, sent, send(item), leave; result 1",
            test: () => {
                // setup
                this.setupDataLossAnalyzer();
                var sender = this.getSender();
                this.fakeServer.requests.pop(); // xhr was created inside Sender's constructor, removing it to avoid confusion
                var senderSpy = this.sandbox.spy(sender, "_sender");

                // act
                sender.send(this.testTelemetry);
                sender.triggerSend();
                this.fakeServer.requests[0].respond(200, {}, "");
                sender.send(this.testTelemetry);

                // Validate
                Assert.equal(1, Microsoft.ApplicationInsights.DataLossAnalyzer.getNumberOfLostItems());
            }
        });

        this.testCase({
            name: "SenderTests: data loss analyzer - send(item), queued, post failed; result 1",
            test: () => {
                // setup
                this.setupDataLossAnalyzer();
                var sender = this.getSender();
                this.fakeServer.requests.pop(); // xhr was created inside Sender's constructor, removing it to avoid confusion
                var senderSpy = this.sandbox.spy(sender, "_sender");

                // act
                sender.send(this.testTelemetry);
                sender.triggerSend();
                this.fakeServer.requests[0].respond(400, {}, "");

                // Validate
                Assert.equal(1, Microsoft.ApplicationInsights.DataLossAnalyzer.getNumberOfLostItems());
            }
        });

        this.testCase({
            name: "SenderTests: data loss analyzer is disabled for XDomainRequest",
            test: () => {
                // setup
                Microsoft.ApplicationInsights.DataLossAnalyzer.enabled = true;
                Microsoft.ApplicationInsights.DataLossAnalyzer.appInsights = <any>{ trackTrace: (message) => { }, flush: () => { }, context: { _sender: { _XMLHttpRequestSupported: false } } };
                var sender = this.getSender();
                this.fakeServer.requests.pop(); // xDomainRequest was created inside Sender's constructor, removing it to avoid confusion
                var senderSpy = this.sandbox.spy(sender, "_sender");

                // act
                sender.send(this.testTelemetry);
                sender.triggerSend();
                this.fakeServer.requests[0].respond(400, {}, "");

                // Validate
                Assert.equal(0, Microsoft.ApplicationInsights.DataLossAnalyzer.getNumberOfLostItems());
            }
        });*/
        this.testCase({
            name: "SenderTests: use Array buffer by default",
            test: function () {
                // setup
                var config = _this.getDefaultConfig();
                config.enableSessionStorageBuffer = function () { return false; };
                // act
                var sender = new Microsoft.ApplicationInsights.Sender(config);
                // Validate
                Assert.ok(sender._buffer instanceof Microsoft.ApplicationInsights.ArraySendBuffer, "sender should use Array buffer by default");
            }
        });
        this.testCase({
            name: "SenderTests: use SessionStorageBuffer when enableSessionStorageBuffer is true",
            test: function () {
                // setup
                var config = _this.getDefaultConfig();
                config.enableSessionStorageBuffer = function () { return true; };
                // act
                var sender = new Microsoft.ApplicationInsights.Sender(config);
                // Validate
                Assert.ok(sender._buffer instanceof Microsoft.ApplicationInsights.SessionStorageSendBuffer, "sender should use SessionStorage buffer");
            }
        });
        this.testCase({
            name: "SenderTests: does not use SessionStorageBuffer when enableSessionStorageBuffer is true and SessionStorage is not supported",
            test: function () {
                var utilCanUseSession = Microsoft.ApplicationInsights.Util.canUseSessionStorage;
                // setup
                var config = _this.getDefaultConfig();
                config.enableSessionStorageBuffer = function () { return true; };
                Microsoft.ApplicationInsights.Util.canUseSessionStorage = function () {
                    return false;
                };
                // act
                var sender = new Microsoft.ApplicationInsights.Sender(config);
                // Validate
                Assert.ok(sender._buffer instanceof Microsoft.ApplicationInsights.ArraySendBuffer, "sender should use Array buffer");
                // clean up
                Microsoft.ApplicationInsights.Util.canUseSessionStorage = utilCanUseSession;
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest sender retries on retriable response code from the backend.",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var retriableResponses = [408, 429, 500, 503];
                retriableResponses.forEach(function (statusCode) {
                    var sender = _this.getSender();
                    Assert.ok(sender, "sender was constructed. Testing response code: " + statusCode);
                    // send two items
                    _this.fakeServer.requests.pop();
                    sender.send(_this.testTelemetry);
                    sender.send(_this.testTelemetry);
                    Assert.equal(2, sender._buffer.count(), "Buffer has two items");
                    // trigger send
                    _this.clock.tick(sender._config.maxBatchInterval());
                    _this.requestAsserts();
                    _this.fakeServer.requests.pop().respond(statusCode, { "Content-Type": "application/json" }, 
                    // response with retriable status code
                    '{ "itemsReceived": 2, "itemsAccepted": 0, "errors": [{ "index": 0, "statusCode": 408, "message": "error" }, { "index": 1, "statusCode": 408, "message": "error" }] }');
                    // verify
                    Assert.ok(sender.successSpy.notCalled, "success was not invoked");
                    Assert.ok(sender.errorSpy.notCalled, "error was not invoked");
                    _this.logAsserts(1);
                    Assert.equal(2, sender._buffer.count(), "Buffer has 2 items to retry.");
                    // validate session storage buffers
                    var buffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.BUFFER_KEY));
                    var sentBuffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.SENT_BUFFER_KEY));
                    Assert.equal(2, buffer.length, "Session storage buffer has 2 items");
                    Assert.equal(0, sentBuffer.length, "Session storage sent buffer is empty");
                    // clean up
                    _this.testCleanup();
                });
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest sender does NOT retry on non-retriable response code from the backend.",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var retriableResponses = [300, 400, 404, 501];
                retriableResponses.forEach(function (statusCode) {
                    var sender = _this.getSender();
                    Assert.ok(sender, "sender was constructed. Testing response code: " + statusCode);
                    // send two items
                    _this.fakeServer.requests.pop();
                    sender.send(_this.testTelemetry);
                    sender.send(_this.testTelemetry);
                    Assert.equal(2, sender._buffer.count(), "Buffer has two items");
                    // trigger send
                    _this.clock.tick(sender._config.maxBatchInterval());
                    _this.requestAsserts();
                    _this.fakeServer.requests.pop().respond(statusCode, { "Content-Type": "application/json" }, 
                    // response with retriable status code
                    '{ "itemsReceived": 2, "itemsAccepted": 0, "errors": [{ "index": 0, "statusCode": 408, "message": "error" }, { "index": 1, "statusCode": 408, "message": "error" }] }');
                    // verify
                    Assert.ok(sender.successSpy.notCalled, "success was not invoked");
                    Assert.ok(sender.errorSpy.called, "error was invoked");
                    _this.logAsserts(1);
                    Assert.equal(0, sender._buffer.count(), "Buffer has 0 items - nothing to retry.");
                    // validate session storage buffers
                    var buffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.BUFFER_KEY));
                    var sentBuffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.SENT_BUFFER_KEY));
                    Assert.equal(0, buffer.length, "Session storage buffer is empty");
                    Assert.equal(0, sentBuffer.length, "Session storage sent buffer is empty");
                    // clean up
                    _this.testCleanup();
                });
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest sender can handle partial success errors. Non-retryable",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                _this.validatePartialSuccess_NonRetryable(sender);
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest sender can handle partial success errors. Retryable",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                _this.validatePartialSuccess_Retryable(sender);
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest - can disable partial response handling",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                // disable partial response handling
                sender._config.isRetryDisabled = function () { return true; };
                _this.validatePartialSuccess_disabled(sender);
            }
        });
        this.testCase({
            name: "SenderTests: XDomain sender can handle partial success errors. Non-retryable",
            test: function () {
                // setup
                // pretend that you are IE8/IE9 browser which supports XDomainRequests
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    delete xhr.withCredentials;
                    return xhr;
                });
                XDomainRequest = (function () {
                    var xdr = new _this.xhr;
                    xdr.onload = xdr.onreadystatechange;
                    xdr.responseText = 206;
                    return xdr;
                });
                var sender = _this.getSender();
                sender._config.endpointUrl = function () { return window.location.protocol + "//fakeEndpoint"; };
                _this.validatePartialSuccess_NonRetryable(sender);
            }
        });
        this.testCase({
            name: "SenderTests: XDomain sender can handle partial success errors. Retryable",
            test: function () {
                // setup
                // pretend that you are IE8/IE9 browser which supports XDomainRequests
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    delete xhr.withCredentials;
                    return xhr;
                });
                XDomainRequest = (function () {
                    var xdr = new _this.xhr;
                    xdr.onload = xdr.onreadystatechange;
                    xdr.responseText = 206;
                    return xdr;
                });
                var sender = _this.getSender();
                sender._config.endpointUrl = function () { return window.location.protocol + "//fakeEndpoint"; };
                _this.validatePartialSuccess_Retryable(sender);
            }
        });
        this.testCase({
            name: "SenderTests: XDomain - can disable partial response handling",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    delete xhr.withCredentials;
                    return xhr;
                });
                var sender = _this.getSender();
                sender._config.endpointUrl = function () { return window.location.protocol + "//fakeEndpoint"; };
                sender._config.isRetryDisabled = function () { return true; };
                _this.validatePartialSuccess_disabled(sender);
            }
        });
        this.testCase({
            name: "SenderTests: ParseResponse - invalid number of errors",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                Assert.ok(sender, "sender was constructed");
                // too many errors
                var response = '{ "itemsReceived": 2, "itemsAccepted": 1, "errors": [{ "index": 0, "statusCode": 408, "message": "error" }, { "index": 2, "statusCode": 429, "message": "error" }] }';
                var result = sender._parseResponse(response);
                Assert.ok(!result, "Parse should fail when there are too many errors (2 instead of 1)");
                // no errors
                response = '{ "itemsReceived": 2, "itemsAccepted": 1, "errors": [] }';
                result = sender._parseResponse(response);
                Assert.ok(!result, "Parse should fail - there should be one error");
                // no warnings
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: ParseResponse - invalid number of accepted items",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                Assert.ok(sender, "sender was constructed");
                // too many items accepted
                var response = '{ "itemsReceived": 1, "itemsAccepted": 2, "errors": [] }';
                var result = sender._parseResponse(response);
                Assert.ok(!result, "Parse should fail - there are too itemsAccepted > itemsReceived");
                // no warnings
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: ParseResponse - invalid response",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                Assert.ok(sender, "sender was constructed");
                var response = '{}';
                var result = sender._parseResponse(response);
                Assert.ok(!result, "Parse should fail for an empty response");
                response = '{ "itemsReceived": 1, "itemsAccepted": 2, "errors": [] }';
                result = sender._parseResponse(response);
                Assert.ok(!result, "Parse should fail - itemsAccepted grater than itemsReceived");
                response = '{ "itemsAccepted": 2, "errors": [] }';
                result = sender._parseResponse(response);
                Assert.ok(!result, "Parse should fail - itemsReceived field missing");
                // no warnings
                _this.logAsserts(0);
            }
        });
        this.testCase({
            name: "SenderTests: ParseResponse - parse error logs a InvalidBackendResponse error",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                Assert.ok(sender, "sender was constructed");
                var response = '{ "itemsReceived: }';
                var result = sender._parseResponse(response);
                Assert.ok(!result, "Parse should fail");
                _this.logAsserts(1);
                Assert.equal('AI (Internal): InvalidBackendResponse message:"Cannot parse the response. SyntaxError"', _this.loggingSpy.args[0][0], "Expecting one warning message");
            }
        });
        this.testCase({
            name: "SenderTests: setRetryTime sets correct _retryAt for zero and one consecutive errors",
            test: function () {
                // setup
                var sender = _this.getSender();
                Assert.ok(sender, "sender was constructed");
                var now = 1468864738000;
                _this.clock.setSystemTime(now);
                // zero consecutive errors
                sender._consecutiveErrors = 0;
                sender._setRetryTime();
                Assert.equal(now + 10 * 1000, sender._retryAt, "Invalid retry time.");
                // one consecutive errors
                sender._consecutiveErrors = 1;
                sender._setRetryTime();
                Assert.equal(now + 10 * 1000, sender._retryAt, "Invalid retry time.");
            }
        });
        this.testCase({
            name: "SenderTests: setRetryTime sets correct _retryAt for two consecutive errors",
            test: function () {
                // setup
                var sender = _this.getSender();
                Assert.ok(sender, "sender was constructed");
                var now = 1468864738000;
                _this.clock.setSystemTime(now);
                // act
                sender._consecutiveErrors = 2;
                sender._setRetryTime();
                // validate - exponential back = 1.5 * Random() * 10 + 1
                Assert.ok(sender._retryAt >= now + 1 * 1000, "Invalid retry time.");
                Assert.ok(sender._retryAt <= now + 16 * 1000, "Invalid retry time.");
            }
        });
        this.testCase({
            name: "SenderTests: XMLHttpRequest can send and process the resposne from Vortex",
            test: function () {
                // setup
                XMLHttpRequest = (function () {
                    var xhr = new _this.xhr;
                    xhr.withCredentials = false;
                    return xhr;
                });
                var sender = _this.getSender();
                Assert.ok(sender, "sender was constructed");
                // send sample telemetry
                _this.fakeServer.requests.pop();
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // handle 200 from the Vortex
                _this.requestAsserts();
                _this.fakeServer.requests.pop().respond(200, { "Content-Type": "application/json" }, '{"ipv":false,"pvm":null,"rej":0,"bln":0,"acc":1,"efi":[]}');
                _this.successAsserts(sender);
                _this.logAsserts(0);
                sender.successSpy.reset();
                sender.errorSpy.reset();
                // send sample telemetry
                _this.fakeServer.requests.pop();
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // handle 404 from the Vortex
                _this.requestAsserts();
                _this.fakeServer.requests.pop().respond(404, { "Content-Type": "application/json" }, '{"ipv":false,"pvm":null,"rej":1,"bln":0,"acc":0,"efi":["404"]}');
                _this.errorAsserts(sender);
                _this.logAsserts(1);
                sender.successSpy.reset();
                sender.errorSpy.reset();
                // cleanup
                _this.loggingSpy.reset();
                // send sample telemetry
                _this.fakeServer.requests.pop();
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // handle 206 from the Vortex. We don't handle partial retries from Vortex. 
                _this.requestAsserts();
                _this.fakeServer.requests.pop().respond(206, { "Content-Type": "application/json" }, '{"ipv":false,"pvm":null,"rej":1,"bln":0,"acc":0,"efi":["206"]}');
                _this.errorAsserts(sender);
                _this.logAsserts(1);
                sender.successSpy.reset();
                sender.errorSpy.reset();
                // nothing to retry - validate session storage buffers are empty 
                var buffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.BUFFER_KEY));
                var sentBuffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.SENT_BUFFER_KEY));
                Assert.equal(0, buffer.length, "Session storage buffer is empty");
                Assert.equal(0, sentBuffer.length, "Session storage sent buffer is empty");
            }
        });
        this.testCase({
            name: "SenderTests: send() is using BeaconAPI sender if the BeaconAPI is enabled",
            test: function () {
                // enable beacon API and mock sender
                var config = _this.getDefaultConfig();
                config.isBeaconApiDisabled = function () { return false; };
                var sender = new Microsoft.ApplicationInsights.Sender(config);
                sender.beaconStub = _this.sandbox.stub(navigator, "sendBeacon");
                Assert.ok(sender, "sender was constructed");
                Assert.ok(Microsoft.ApplicationInsights.Util.IsBeaconApiSupported(), "Beacon API is supported");
                Assert.ok(sender.beaconStub.notCalled, "Beacon API was not called before");
                // send telemetry
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify that beaconSender was used
                Assert.ok(sender.beaconStub.calledOnce, "Beacon API was called once");
            }
        });
        this.testCase({
            name: "SenderTests: send() is not using BeaconAPI sender if the BeaconAPI is disabled",
            test: function () {
                // enable beacon API and mock sender
                var config = _this.getDefaultConfig();
                config.isBeaconApiDisabled = function () { return true; };
                var sender = new Microsoft.ApplicationInsights.Sender(config);
                sender.beaconStub = _this.sandbox.stub(navigator, "sendBeacon");
                Assert.ok(sender, "sender was constructed");
                Assert.ok(Microsoft.ApplicationInsights.Util.IsBeaconApiSupported(), "Beacon API is supported");
                Assert.ok(sender.beaconStub.notCalled, "Beacon API was not called before");
                // send telemetry
                sender.send(_this.testTelemetry);
                _this.clock.tick(sender._config.maxBatchInterval());
                // verify that beaconSender was used
                Assert.ok(sender.beaconStub.notCalled, "Beacon API was not called before");
            }
        });
    };
    SenderTests.prototype.setupDataLossAnalyzer = function () {
        // TODO: move DataLossAnalyzer tests to a separate class
        // Microsoft.ApplicationInsights.DataLossAnalyzer.enabled = true;
        // Microsoft.ApplicationInsights.DataLossAnalyzer.appInsights = <any>{ trackTrace: (message) => { }, flush: () => { }, context: { _sender: { _XMLHttpRequestSupported: true } } };
    };
    SenderTests.prototype.validatePartialSuccess_NonRetryable = function (sender) {
        Assert.ok(sender, "sender was constructed");
        // send two items
        this.fakeServer.requests.pop();
        sender.send(this.testTelemetry);
        sender.send(this.testTelemetry);
        Assert.equal(2, sender._buffer.count(), "Buffer has two items");
        // trigger send
        this.clock.tick(sender._config.maxBatchInterval());
        this.requestAsserts();
        this.fakeServer.requests.pop().respond(206, { "Content-Type": "application/json" }, 
        // backend rejected 1 out of 2 payloads. First payload was too old and should be dropped (non-retryable).
        '{ "itemsReceived": 2, "itemsAccepted": 1, "errors": [{ "index": 0, "statusCode": 400, "message": "103: Field time on type Envelope is older than the allowed min date. Expected: now - 172800000ms, Actual: now - 31622528281ms" }] }');
        // verify
        Assert.ok(sender.successSpy.called, "success was invoked");
        this.logAsserts(1);
        Assert.equal('AI (Internal): OnError message:"Failed to send telemetry." props:"{message:partial success 1 of 2}"', this.loggingSpy.args[0][0], "Expecting one warning message");
        // the buffer is empty. 
        Assert.equal(0, sender._buffer.count(), "Buffer is empty");
        // session storage buffers are also empty
        var buffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.BUFFER_KEY));
        var sentBuffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.SENT_BUFFER_KEY));
        Assert.equal(0, buffer.length, "Session storage buffer is empty");
        Assert.equal(0, sentBuffer.length, "Session storage sent buffer is empty");
        // clean up
        sender.successSpy.reset();
        sender.errorSpy.reset();
    };
    SenderTests.prototype.validatePartialSuccess_Retryable = function (sender) {
        Assert.ok(sender, "sender was constructed");
        // send six items
        this.fakeServer.requests.pop();
        for (var i = 0; i < 6; i++) {
            var payload = {
                aiDataContract: {
                    payload: 0
                },
                ver: 0,
                name: null,
                time: null,
                sampleRate: null,
                seq: null,
                iKey: null,
                flags: null,
                deviceId: null,
                os: null,
                osVer: null,
                appId: null,
                appVer: null,
                userId: null,
                tags: null,
                payload: i
            };
            sender.send(payload);
        }
        Assert.equal(6, sender._buffer.count(), "Buffer has six items");
        // trigger send
        this.clock.tick(sender._config.maxBatchInterval());
        this.requestAsserts();
        this.fakeServer.requests.pop().respond(206, { "Content-Type": "application/json" }, 
        // backend rejected 5 out of 6 payloads. Rejected payloads response codes: 408, 429, 429, 500, 503 (all retryable)
        '{ "itemsReceived": 6, "itemsAccepted": 1, "errors": [{ "index": 1, "statusCode": 408, "message": "error" }, { "index": 2, "statusCode": 429, "message": "error" }, { "index": 3, "statusCode": 429, "message": "error" }, { "index": 4, "statusCode": 500, "message": "error" }, { "index": 5, "statusCode": 503, "message": "error" }] }');
        // verify
        Assert.ok(sender.successSpy.called, "success was invoked");
        // partial response warning
        this.logAsserts(1);
        // the buffer has 5 items - payloads 1-5, payload 0 was accepted by the backend and should not be re-send
        Assert.equal(5, sender._buffer.count(), "Buffer has 5 items to retry.");
        Assert.equal('{"payload":5}', sender._buffer.getItems()[0], "Invalid item in the buffer");
        Assert.equal('{"payload":1}', sender._buffer.getItems()[4], "Invalid item in the buffer");
        // validate session storage buffers
        var buffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.BUFFER_KEY));
        var sentBuffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.SENT_BUFFER_KEY));
        Assert.equal(5, buffer.length, "Session storage buffer has 5 items");
        Assert.equal(0, sentBuffer.length, "Session storage sent buffer is empty");
        // clean up
        sender.successSpy.reset();
        sender.errorSpy.reset();
    };
    SenderTests.prototype.validatePartialSuccess_disabled = function (sender) {
        // send two items
        this.fakeServer.requests.pop();
        sender.send(this.testTelemetry);
        sender.send(this.testTelemetry);
        Assert.equal(2, sender._buffer.count(), "Buffer has two items");
        // trigger send
        this.clock.tick(sender._config.maxBatchInterval());
        this.requestAsserts();
        this.fakeServer.requests.pop().respond(206, { "Content-Type": "application/json" }, 
        // backend rejected 1 out of 2 payloads. First payload was too old and should be dropped (non-retryable).
        '{ "itemsReceived": 2, "itemsAccepted": 1, "errors": [{ "index": 0, "statusCode": 400, "message": "103: Field time on type Envelope is older than the allowed min date. Expected: now - 172800000ms, Actual: now - 31622528281ms" }] }');
        // verify
        Assert.ok(!sender.successSpy.called, "success was NOT invoked");
        Assert.ok(!sender.partialSpy.called, "partialSpy was NOT invoked");
        Assert.ok(sender.errorSpy.called, "error was invoked");
        this.logAsserts(1);
        Assert.ok(this.loggingSpy.args[0][0].concat('AI (Internal): OnError message:"Failed to send telemetry.'), "Expecting one warning message");
        // the buffer is empty. 
        Assert.equal(0, sender._buffer.count(), "Buffer is empty");
        // session storage buffers are also empty
        var buffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.BUFFER_KEY));
        var sentBuffer = JSON.parse(Microsoft.ApplicationInsights.Util.getSessionStorage(Microsoft.ApplicationInsights.SessionStorageSendBuffer.SENT_BUFFER_KEY));
        Assert.equal(0, buffer.length, "Session storage buffer is empty");
        Assert.equal(0, sentBuffer.length, "Session storage sent buffer is empty");
    };
    SenderTests.prototype.getDefaultConfig = function () {
        var _this = this;
        return {
            endpointUrl: function () { return _this.endpointUrl; },
            emitLineDelimitedJson: function () { return _this.emitLineDelimitedJson; },
            maxBatchSizeInBytes: function () { return _this.maxBatchSizeInBytes; },
            maxBatchInterval: function () { return _this.maxBatchInterval; },
            disableTelemetry: function () { return _this.disableTelemetry; },
            enableSessionStorageBuffer: function () { return true; },
            isRetryDisabled: function () { return false; },
            isBeaconApiDisabled: function () { return true; }
        };
    };
    return SenderTests;
}(TestClass));
new SenderTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/sender.ts" />
/// <reference path="../../javascriptsdk/appinsights.ts" />
var SendBufferTests = (function (_super) {
    __extends(SendBufferTests, _super);
    function SendBufferTests() {
        _super.apply(this, arguments);
        this.BUFFER_KEY = "AI_buffer";
        this.SENT_BUFFER_KEY = "AI_sentBuffer";
    }
    SendBufferTests.prototype.testInitialize = function () {
        if (Microsoft.ApplicationInsights.Util.canUseSessionStorage()) {
            sessionStorage.clear();
        }
        var config = {
            emitLineDelimitedJson: function () { return false; },
            enableSessionStorageBuffer: function () { return false; },
            endpointUrl: function () { return null; },
            maxBatchSizeInBytes: function () { return null; },
            maxBatchInterval: function () { return null; },
            disableTelemetry: function () { return null; },
            isRetryDisabled: function () { return null; },
            isBeaconApiDisabled: function () { return true; }
        };
        this.getArraySendBuffer = function (emitLineDelimitedJson) {
            if (emitLineDelimitedJson) {
                config.emitLineDelimitedJson = function () { return emitLineDelimitedJson; };
            }
            return new Microsoft.ApplicationInsights.ArraySendBuffer(config);
        };
        this.getSessionStorageSendBuffer = function (emitLineDelimitedJson) {
            if (emitLineDelimitedJson) {
                config.emitLineDelimitedJson = function () { return emitLineDelimitedJson; };
            }
            return new Microsoft.ApplicationInsights.SessionStorageSendBuffer(config);
        };
    };
    SendBufferTests.prototype.testCleanup = function () {
        // reset enableDebugger to a default value
        Microsoft.ApplicationInsights._InternalLogging.enableDebugExceptions = function () { return false; };
    };
    SendBufferTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "ArraySendBuffer: initialize",
            test: function () {
                var buffer = _this.getArraySendBuffer();
                _this.Test_Initialize(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: initialize",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                _this.Test_Initialize(buffer);
            }
        });
        this.testCase({
            name: "ArraySendBuffer: can enqueue and clear the buffer",
            test: function () {
                var buffer = _this.getArraySendBuffer();
                _this.Test_CanEnqueueAndClearTheBuffer(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: can enqueue and clear the buffer",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                _this.Test_CanEnqueueAndClearTheBuffer(buffer);
            }
        });
        this.testCase({
            name: "ArraySendBuffer: can clear empty buffer",
            test: function () {
                var buffer = _this.getArraySendBuffer();
                _this.Test_CanClearEmptyBuffer(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: can clear empty buffer",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                _this.Test_CanClearEmptyBuffer(buffer);
            }
        });
        this.testCase({
            name: "ArraySendBuffer: call batchPayloads when a buffer is empty",
            test: function () {
                var buffer = _this.getArraySendBuffer();
                _this.Test_CanClearEmptyBuffer(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: call batchPayloads when a buffer is empty",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                _this.Test_CanClearEmptyBuffer(buffer);
            }
        });
        this.testCase({
            name: "ArraySendBuffer: call batchPayloads when a buffer has one element",
            test: function () {
                var buffer = _this.getArraySendBuffer();
                _this.Test_CallBatchPayloadsWithOneElement(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: call batchPayloads when a buffer has one element",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                _this.Test_CallBatchPayloadsWithOneElement(buffer);
            }
        });
        this.testCase({
            name: "ArraySendBuffer: call batchPayloads when a buffer has two elements",
            test: function () {
                var buffer = _this.getArraySendBuffer();
                _this.Test_CallBatchPayloadsWithTwoElements(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: call batchPayloads when a buffer has two elements",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                _this.Test_CallBatchPayloadsWithTwoElements(buffer);
            }
        });
        this.testCase({
            name: "ArraySendBuffer: call batchPayloads when a buffer has two elements - emitLineDelimitedJson",
            test: function () {
                var buffer = _this.getArraySendBuffer(true);
                _this.Test_CallBatchPayloadsWithTwoElements_EmitLineDelimitedJson(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: call batchPayloads when a buffer has two elements - emitLineDelimitedJson",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer(true);
                _this.Test_CallBatchPayloadsWithTwoElements_EmitLineDelimitedJson(buffer);
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: is restored from the Session storage in constructor",
            test: function () {
                // setup
                var buffer = _this.getSessionStorageSendBuffer(true);
                var payload1 = "{ test: test1 }";
                var payload2 = "{ test: test2 }";
                var payload3 = "{ test: test3 }";
                // act
                buffer.enqueue(payload1);
                buffer.enqueue(payload2);
                buffer.enqueue(payload3);
                var sent = [payload1, payload2];
                buffer.markAsSent(sent);
                var delivered = [payload1];
                buffer.clearSent(delivered);
                var buffer2 = _this.getSessionStorageSendBuffer(true);
                // verify
                Assert.equal(2, buffer2.count(), "there should be two elements in the buffer");
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: markAsSent saves items in the SENT_BUFFER",
            test: function () {
                // setup
                var buffer = _this.getSessionStorageSendBuffer(true);
                // act
                var payload1 = "{ test: test }";
                var payload2 = "{ test: test }";
                buffer.enqueue(payload1);
                buffer.enqueue(payload2);
                // verify
                Assert.equal(2, buffer.count(), "there should be two elements in the buffer");
                // act
                var payload = buffer.getItems();
                buffer.markAsSent(payload);
                // verify
                Assert.equal(0, buffer.count(), "There shouldn't be any items in the buffer");
                var sentBuffer = _this.getBuffer(_this.SENT_BUFFER_KEY);
                Assert.equal(2, sentBuffer.length, "There should be 2 items in the sent buffer");
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: markAsSent removes only sent items from the buffer",
            test: function () {
                // setup
                var buffer = _this.getSessionStorageSendBuffer(true);
                // act
                var payload1 = "{ test: test1 }";
                var payload2 = "{ test: test2 }";
                var payload3 = "{ test: test3 }";
                buffer.enqueue(payload1);
                buffer.enqueue(payload2);
                buffer.enqueue(payload3);
                // verify
                Assert.equal(3, buffer.count(), "there should be three elements in the buffer");
                // act
                var payload = [payload1, payload2];
                buffer.markAsSent(payload);
                // verify
                Assert.equal(1, buffer.count(), "There should be one notsent item left in the buffer");
                var sentBuffer = _this.getBuffer(_this.SENT_BUFFER_KEY);
                Assert.equal(2, sentBuffer.length, "There should be 2 items in the sent buffer");
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: clearSent clears the SENT_BUFFER",
            test: function () {
                // setup
                var buffer = _this.getSessionStorageSendBuffer(true);
                var payload1 = "{ test: test1 }";
                var payload2 = "{ test: test2 }";
                buffer.enqueue(payload1);
                buffer.enqueue(payload2);
                var payload = buffer.getItems();
                buffer.markAsSent(payload);
                // act
                buffer.clearSent(payload);
                // verify
                var sentBuffer = _this.getBuffer(_this.SENT_BUFFER_KEY);
                Assert.equal(0, sentBuffer.length, "There should be 0 items in the sent buffer");
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: does not store more than 2000 elements",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                for (var i = 0; i < 2000; i++) {
                    buffer.enqueue("i=" + i);
                }
                Assert.equal(2000, buffer.count(), "Buffer has 100 elements");
                buffer.enqueue("I don't fit!");
                Assert.equal(2000, buffer.count(), "Buffer should not allow to enqueue 101th element");
            }
        });
        this.testCase({
            name: "SessionStorageSendBuffer: logs a warning if the buffer is full",
            test: function () {
                var buffer = _this.getSessionStorageSendBuffer();
                var loggingSpy = _this.sandbox.spy(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                for (var i = 0; i < 2000; i++) {
                    buffer.enqueue("i=" + i);
                }
                Assert.equal(2000, buffer.count(), "Buffer has 100 elements");
                buffer.enqueue("I don't fit!");
                Assert.ok(loggingSpy.calledOnce, "BufferFull warning logged to console");
                buffer.enqueue("I don't fit!");
                Assert.ok(loggingSpy.calledOnce, "BufferFull warning should be logged only once.");
            }
        });
    };
    SendBufferTests.prototype.getBuffer = function (key) {
        var bufferJson = Microsoft.ApplicationInsights.Util.getSessionStorage(key);
        if (bufferJson) {
            var buffer = JSON.parse(bufferJson);
            if (buffer) {
                return buffer;
            }
        }
        return [];
    };
    SendBufferTests.prototype.Test_Initialize = function (buffer) {
        // verify
        Assert.equal(0, buffer.count(), "new buffer should be empty");
    };
    SendBufferTests.prototype.Test_CanEnqueueAndClearTheBuffer = function (buffer) {
        // act
        buffer.enqueue("");
        // verify
        Assert.equal(1, buffer.count(), "one item expected");
        // act
        buffer.enqueue("");
        // verify
        Assert.equal(2, buffer.count(), "two items expected");
        //act
        buffer.clear();
        // verify
        Assert.equal(0, buffer.count(), "buffer should be empty");
    };
    SendBufferTests.prototype.Test_CanClearEmptyBuffer = function (buffer) {
        //verify
        Assert.equal(0, buffer.count(), "buffer should be empty");
        // act
        buffer.clear();
        // verify
        Assert.equal(0, buffer.count(), "buffer should be empty");
    };
    SendBufferTests.prototype.Test_CallBatchPayloadsWhenABufferIsEmpty = function (buffer) {
        // act
        var batch = buffer.batchPayloads(null);
        // verify
        Assert.equal(null, batch, "expecting null");
    };
    SendBufferTests.prototype.Test_CallBatchPayloadsWithOneElement = function (buffer) {
        // act
        var payload = "{ test: test }";
        var batch = buffer.batchPayloads([payload]);
        // verify
        Assert.equal("[" + payload + "]", batch, "invalid batch");
    };
    SendBufferTests.prototype.Test_CallBatchPayloadsWithTwoElements = function (buffer) {
        // act
        var payload1 = "{ test: test }";
        var payload2 = "{ }";
        var batch = buffer.batchPayloads([payload1, payload2]);
        // verify
        Assert.equal(['[', payload1, ',', payload2, ']'].join(''), batch, "invalid batch");
    };
    SendBufferTests.prototype.Test_CallBatchPayloadsWithTwoElements_EmitLineDelimitedJson = function (buffer) {
        // act
        var payload1 = "{ test: test }";
        var payload2 = "{ test: test }";
        var batch = buffer.batchPayloads([payload1, payload2]);
        // verify
        Assert.equal(payload1 + "\n" + payload2, batch, "invalid batch");
    };
    return SendBufferTests;
}(TestClass));
new SendBufferTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/serializer.ts" />
var SerializerTests = (function (_super) {
    __extends(SerializerTests, _super);
    function SerializerTests() {
        _super.apply(this, arguments);
    }
    /** Method called before the start of each test method */
    SerializerTests.prototype.testInitialize = function () {
        this.throwInternal = this.sandbox.spy(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
    };
    SerializerTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "SerializerTests: empty input",
            test: function () {
                // act
                Microsoft.ApplicationInsights.Serializer.serialize(null);
                // verify
                Assert.ok(_this.throwInternal.calledOnce, "throw internal when input is null");
            }
        });
        this.testCase({
            name: "SerializerTests: objects without a contract are serialized",
            test: function () {
                // act
                var obj = {
                    str: "str",
                    noContract: {
                        stillSerializable: "yep"
                    },
                    aiDataContract: {
                        str: Microsoft.ApplicationInsights.FieldType.Required,
                        noContract: Microsoft.ApplicationInsights.FieldType.Required
                    }
                };
                var expected = '{"str":"str","noContract":{"stillSerializable":"yep"}}';
                var actual = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.equal(expected, actual, "Object is serialized correctly");
                Assert.ok(_this.throwInternal.calledOnce, "warning when contract is omitted");
            }
        });
        this.testCase({
            name: "SerializerTests: required objects that are not present throw",
            test: function () {
                // act
                var obj = {
                    aiDataContract: {
                        str: Microsoft.ApplicationInsights.FieldType.Required
                    }
                };
                var expected = "{}";
                var actual = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.equal(expected, actual, "Object is serialized correctly");
                Assert.ok(_this.throwInternal.calledOnce, "broken contracts throw");
            }
        });
        this.testCase({
            name: "SerializerTests: serialize an item with an array",
            test: function () {
                // act
                var noCycle = { value: "value", aiDataContract: { value: Microsoft.ApplicationInsights.FieldType.Required } };
                var obj = {
                    arr: [
                        noCycle,
                        noCycle,
                        noCycle
                    ],
                    aiDataContract: { arr: Microsoft.ApplicationInsights.FieldType.Array }
                };
                var expected = '{"arr":[{"value":"value"},{"value":"value"},{"value":"value"}]}';
                var actual = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.equal(expected, actual, "Object is serialized correctly");
                Assert.ok(_this.throwInternal.notCalled, "no errors");
            }
        });
        this.testCase({
            name: "SerializerTests: serialize an item which claims to have an array but does not",
            test: function () {
                // act
                var obj = {
                    arr: {},
                    aiDataContract: { arr: Microsoft.ApplicationInsights.FieldType.Array }
                };
                Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.ok(_this.throwInternal.calledOnce, "one error");
            }
        });
        this.testCase({
            name: "SerializerTests: hidden fields are not serialized",
            test: function () {
                // act
                var obj = {
                    str: "yes!",
                    hiddenStr: "im the invisible man",
                    hiddenStrRequired: "required fields can also be marked as hidden",
                    aiDataContract: {
                        str: Microsoft.ApplicationInsights.FieldType.Required,
                        hiddenStr: Microsoft.ApplicationInsights.FieldType.Hidden,
                        hiddenStrRequired: Microsoft.ApplicationInsights.FieldType.Required | Microsoft.ApplicationInsights.FieldType.Hidden,
                    }
                };
                var expected = '{"str":"yes!"}';
                var actual = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.equal(expected, actual, "Object is serialized correctly");
            }
        });
        this.testCase({
            name: "SerializerTests: serialize a field which has a dynamic required state",
            test: function () {
                // act
                var obj = {
                    str: "required",
                    strOptional: "optional",
                    aiDataContract: {
                        str: { isRequired: function () { return Microsoft.ApplicationInsights.FieldType.Required; } },
                        strOptional: { isRequired: function () { return Microsoft.ApplicationInsights.FieldType.Default; } }
                    }
                };
                var expected = '{"str":"required","strOptional":"optional"}';
                var actual = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.equal(expected, actual, "Object is serialized correctly");
            }
        });
        this.testCase({
            name: "SerializerTests: cycles without contracts are handled",
            test: function () {
                // act
                var cyclePt1 = { value: undefined, aiDataContract: { value: Microsoft.ApplicationInsights.FieldType.Required } };
                var cyclePt2 = { value: cyclePt1, aiDataContract: { value: Microsoft.ApplicationInsights.FieldType.Required } };
                cyclePt1.value = cyclePt2;
                var obj = {
                    noContractWithCycle: {
                        notSerializable: cyclePt1
                    },
                    aiDataContract: {
                        noContractWithCycle: Microsoft.ApplicationInsights.FieldType.Required,
                    }
                };
                Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.ok(_this.throwInternal.calledTwice, "user actionable error is thrown");
                var error = _this.throwInternal.args[0][2];
                Assert.equal("Attempting to serialize an object which does not implement ISerializable", error);
            }
        });
        this.testCase({
            name: "SerializerTests: cycles with contracts are handled",
            test: function () {
                // act
                var cyclePt1 = { value: undefined, aiDataContract: { value: Microsoft.ApplicationInsights.FieldType.Required } };
                var cyclePt2 = { value: cyclePt1, aiDataContract: { value: Microsoft.ApplicationInsights.FieldType.Required } };
                cyclePt1.value = cyclePt2;
                var obj = {
                    aCycleWithContract: cyclePt1,
                    aiDataContract: {
                        aCycleWithContract: Microsoft.ApplicationInsights.FieldType.Required,
                    }
                };
                Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.ok(_this.throwInternal.calledOnce, "error is thrown");
                var error = _this.throwInternal.args[0][2];
                Assert.equal("Circular reference detected while serializing object", error, "invalid error message");
            }
        });
        this.testCase({
            name: "SerializerTests: object not present in the contract are not serialized",
            test: function () {
                // act
                var obj = {
                    str: "str",
                    notInContract: "notInContract",
                    aiDataContract: {
                        str: Microsoft.ApplicationInsights.FieldType.Required,
                    }
                };
                var expected = '{"str":"str"}';
                var actual = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                // verify
                Assert.equal(expected, actual, "Object is serialized correctly");
            }
        });
        this.testCase({
            name: "SerializerTests: cycle detection does not modify input",
            test: function () {
                // act
                var obj = {
                    str: "str",
                    aiDataContract: {
                        str: Microsoft.ApplicationInsights.FieldType.Required
                    }
                };
                var expectedFields = {};
                for (var field in obj) {
                    expectedFields[field] = true;
                }
                var expected = '{"str":"str"}';
                var actual = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                for (var xField in obj) {
                    Assert.ok(expectedFields[xField], "unexpected field present after serialization: '" + xField + "'");
                }
                // verify
                Assert.equal(expected, actual, "Object is serialized correctly");
                Assert.ok(_this.throwInternal.notCalled, "no errors");
            }
        });
        this.testCase({
            name: "SerializerTests: properties will be serialized as string:string, measurements will be serilized as string:number",
            test: function () {
                var goodProperties = { a: "1", b: "test" };
                var badProperties = { a: 1, b: { a: "a", b: "b" }, c: [1, 2, 3] };
                var goodMeasurements = { a: 1, b: 2 };
                var badMeasurements = { a: "1", b: "2" };
                var test = function (props, meas, message) {
                    var obj = {
                        properties: props,
                        measurements: meas,
                        aiDataContract: {
                            properties: Microsoft.ApplicationInsights.FieldType.Default,
                            measurements: Microsoft.ApplicationInsights.FieldType.Default
                        }
                    };
                    _this.throwInternal.reset();
                    var result = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                    Assert.ok(result.indexOf("invalid field") < 0, message);
                    Assert.ok(_this.throwInternal.notCalled, "no errors");
                };
                test(goodProperties, goodMeasurements, "properties and measurements");
                test(goodProperties, badMeasurements, "properties and string measurements are parsed to floats");
                test(badProperties, goodMeasurements, "bad properties and measurements");
                test(badProperties, badMeasurements, "bad properties and string measurements are parsed to floatss");
                test(goodProperties, undefined, "properties");
                test(badProperties, undefined, "bad properties");
                test(undefined, goodMeasurements, "measurements");
                test(undefined, badMeasurements, "string measurements are parsed to floats");
                test({ "p1": null, "p2": undefined }, { "m1": null, "m2:": undefined }, "null/undefined check for properties/measurements");
            }
        });
        this.testCase({
            name: "SerializerTests: verifying that null and undefined inputs return expected output",
            test: function () {
                var test = function (props, meas, expectedOutput) {
                    var obj = {
                        properties: props,
                        measurements: meas,
                        aiDataContract: {
                            properties: Microsoft.ApplicationInsights.FieldType.Default,
                            measurements: Microsoft.ApplicationInsights.FieldType.Default,
                        }
                    };
                    _this.throwInternal.reset();
                    var result = Microsoft.ApplicationInsights.Serializer.serialize(obj);
                    Assert.equal(expectedOutput, result);
                    Assert.ok(_this.throwInternal.notCalled, "no user actionable errors");
                };
                test({ "p1": null, "p2": undefined }, { "m1": null, "m2": undefined, "m3": "notanumber" }, "{\"properties\":{\"p1\":\"null\",\"p2\":\"undefined\"},\"measurements\":{\"m1\":\"null\",\"m2\":\"undefined\",\"m3\":\"NaN\"}}");
                var brokenObject = {};
                brokenObject.toString = undefined;
                test({ "p1": brokenObject }, { "m1": 2 }, "{\"properties\":{\"p1\":\"invalid field: toString() is not defined.\"},\"measurements\":{\"m1\":2}}");
            }
        });
    };
    return SerializerTests;
}(TestClass));
new SerializerTests().registerTests();
/// <reference path="../testframework/common.ts" />
/// <reference path="../../JavaScriptSDK/telemetrycontext.ts" />
/// <reference path="../../javascriptsdk/appinsights.ts" />
/// <reference path="../../JavaScriptSDK/Telemetry/Common/Envelope.ts"/>
var TelemetryContextTests = (function (_super) {
    __extends(TelemetryContextTests, _super);
    function TelemetryContextTests() {
        _super.apply(this, arguments);
    }
    /** Method called before the start of each test method */
    TelemetryContextTests.prototype.testInitialize = function () {
        this._config = {
            instrumentationKey: function () { return "testKey"; },
            accountId: function () { return undefined; },
            sessionRenewalMs: function () { return 10; },
            sessionExpirationMs: function () { return 10; },
            endpointUrl: function () { return "asdf"; },
            emitLineDelimitedJson: function () { return false; },
            maxBatchSizeInBytes: function () { return 1000000; },
            maxBatchInterval: function () { return 1; },
            disableTelemetry: function () { return false; },
            sampleRate: function () { return 100; },
            cookieDomain: undefined,
            enableSessionStorageBuffer: function () { return false; },
            isRetryDisabled: function () { return false; },
            isBeaconApiDisabled: function () { return true; }
        };
        this._telemetryContext = new Microsoft.ApplicationInsights.TelemetryContext(this._config);
    };
    /** Method called after each test method has completed */
    TelemetryContextTests.prototype.testCleanup = function () {
        this._telemetryContext.telemetryInitializers = undefined;
    };
    TelemetryContextTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "TelemtetryContext: constructor initializers sender and ikey",
            test: function () {
                var tc = new Microsoft.ApplicationInsights.TelemetryContext(_this._config);
                Assert.ok(tc._sender, "sender is initialized");
                Assert.ok(tc._config.instrumentationKey(), "iKey is initialized");
            }
        });
        this.testCase({
            name: "TelemtetryContext: constructor intialized with correct sdk version",
            test: function () {
                var tc = new Microsoft.ApplicationInsights.TelemetryContext(_this._config);
                Assert.ok(tc.internal, "context.internal is initialized");
                var expectedSdkVersion = "javascript:" + Microsoft.ApplicationInsights.Version;
                Assert.equal(expectedSdkVersion, tc.internal.sdkVersion, "sdkVersion is initialized");
            }
        });
        this.testCase({
            name: "TelemtetryContext: constructor intialized with correct snippet version",
            test: function () {
                Microsoft.ApplicationInsights.SnippetVersion = "test";
                var tc = new Microsoft.ApplicationInsights.TelemetryContext(_this._config);
                Assert.ok(tc.internal, "context.internal is initialized");
                var expectedSnippet = "snippet:" + Microsoft.ApplicationInsights.SnippetVersion;
                Assert.equal(expectedSnippet, tc.internal.agentVersion, "agentVersion is initialized with the snippet version");
                // clean up
                Microsoft.ApplicationInsights.SnippetVersion = undefined;
            }
        });
        this.testCase({
            name: "TelemtetryContext: constructor intialized correctly when snippet version is missing",
            test: function () {
                var tc = new Microsoft.ApplicationInsights.TelemetryContext(_this._config);
                Assert.ok(tc.internal, "context.internal is initialized");
                var expectedSnippet = undefined;
                Assert.equal(expectedSnippet, tc.internal.agentVersion, "agentVersion is NOT initialized with the snippet version is missing");
            }
        });
        this.testCase({
            name: "TelemtetryContext: calling track with null or undefined fails",
            test: function () {
                var tc = new Microsoft.ApplicationInsights.TelemetryContext(_this._config);
                var logSpy = _this.sandbox.spy(Microsoft.ApplicationInsights._InternalLogging, "throwInternal");
                tc.track(undefined);
                Assert.ok(logSpy.calledOnce, "sender throws with undefined");
                tc.track(null);
                Assert.ok(logSpy.calledTwice, "sender throws with null");
            }
        });
        this.testCase({
            name: "TelemtetryContext: does not overwrite user sessioncontext with defaults",
            test: function () {
                _this._telemetryContext.session.id = "101";
                _this._telemetryContext.session.isFirst = true;
                var env = new Microsoft.ApplicationInsights.Telemetry.Common.Envelope(null, "");
                _this._telemetryContext.track(env);
                var contextKeys = new AI.ContextTagKeys();
                Assert.equal("101", env.tags[contextKeys.sessionId], "session.id");
                Assert.equal(true, env.tags[contextKeys.sessionIsFirst], "session.isFirst");
            }
        });
        function getEnvelope(item, dataType, envelopeType) {
            var data = new Microsoft.ApplicationInsights.Telemetry.Common.Data(dataType, item);
            return new Microsoft.ApplicationInsights.Telemetry.Common.Envelope(data, envelopeType);
        }
        this.testCase({
            name: "TelemetryContext: page views get sampled",
            test: function () {
                var stub = _this.getStub(Microsoft.ApplicationInsights.Telemetry.PageView.envelopeType, _this._telemetryContext);
                var envelope = getEnvelope(new Microsoft.ApplicationInsights.Telemetry.PageView("asdf", "asdf", 10), Microsoft.ApplicationInsights.Telemetry.PageView.dataType, Microsoft.ApplicationInsights.Telemetry.PageView.envelopeType);
                // act
                _this._telemetryContext.track(envelope);
                // assert
                Assert.equal(1, stub.isSampledInCallsCount);
                // tear down
            }
        });
        this.testCase({
            name: "TelemetryContext: events get sampled",
            test: function () {
                var stub = _this.getStub(Microsoft.ApplicationInsights.Telemetry.Event.envelopeType, _this._telemetryContext);
                var envelope = getEnvelope(new Microsoft.ApplicationInsights.Telemetry.Event("asdf"), Microsoft.ApplicationInsights.Telemetry.Event.dataType, Microsoft.ApplicationInsights.Telemetry.Event.envelopeType);
                // act
                _this._telemetryContext.track(envelope);
                // assert
                Assert.equal(1, stub.isSampledInCallsCount);
                // tear down
            }
        });
        this.testCase({
            name: "TelemetryContext: exceptions get sampled",
            test: function () {
                var stub = _this.getStub(Microsoft.ApplicationInsights.Telemetry.Exception.envelopeType, _this._telemetryContext);
                var exception;
                try {
                    throw new Error("asdf");
                }
                catch (e) {
                    exception = e;
                }
                var envelope = getEnvelope(new Microsoft.ApplicationInsights.Telemetry.Exception(exception), Microsoft.ApplicationInsights.Telemetry.Exception.dataType, Microsoft.ApplicationInsights.Telemetry.Exception.envelopeType);
                // act
                _this._telemetryContext.track(envelope);
                // assert
                Assert.equal(1, stub.isSampledInCallsCount);
                // tear down
            }
        });
        this.testCase({
            name: "TelemetryContext: metrics do NOT get sampled",
            test: function () {
                var stub = _this.getStub(Microsoft.ApplicationInsights.Telemetry.Metric.envelopeType, _this._telemetryContext);
                var envelope = getEnvelope(new Microsoft.ApplicationInsights.Telemetry.Metric("asdf", 1234), Microsoft.ApplicationInsights.Telemetry.Metric.dataType, Microsoft.ApplicationInsights.Telemetry.Metric.envelopeType);
                // act
                _this._telemetryContext.track(envelope);
                // assert
                Assert.equal(0, stub.isSampledInCallsCount);
                // tear down
            }
        });
        this.testCase({
            name: "TelemetryContext: pageViewPerformance gets sampled",
            test: function () {
                var stub = _this.getStub(Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.envelopeType, _this._telemetryContext);
                var envelope = getEnvelope(new Microsoft.ApplicationInsights.Telemetry.PageViewPerformance("adsf", "asdf", 10), Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.dataType, Microsoft.ApplicationInsights.Telemetry.PageViewPerformance.envelopeType);
                // act
                _this._telemetryContext.track(envelope);
                // assert
                Assert.equal(1, stub.isSampledInCallsCount);
                // tear down
            }
        });
        this.testCase({
            name: "TelemetryContext: traces get sampled",
            test: function () {
                var stub = _this.getStub(Microsoft.ApplicationInsights.Telemetry.Trace.envelopeType, _this._telemetryContext);
                var envelope = getEnvelope(new Microsoft.ApplicationInsights.Telemetry.Trace("afd"), Microsoft.ApplicationInsights.Telemetry.Trace.dataType, Microsoft.ApplicationInsights.Telemetry.Trace.envelopeType);
                // act
                _this._telemetryContext.track(envelope);
                // assert
                Assert.equal(1, stub.isSampledInCallsCount);
                // tear down
            }
        });
        this.testCase({
            name: "TelemetryContext: onBeforeSendTelemetry is called within track() and gets the envelope as an argument",
            test: function () {
                var eventEnvelope = _this.getTestEventEnvelope();
                var telemetryInitializer = {
                    initializer: function (envelope) { }
                };
                var spy = _this.sandbox.spy(telemetryInitializer, "initializer");
                _this._telemetryContext.addTelemetryInitializer(telemetryInitializer.initializer);
                // act
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(spy.calledOnce, "telemetryInitializer was called");
                Assert.ok(eventEnvelope === spy.args[0][0]);
                // teardown
            }
        });
        this.testCase({
            name: "TelemetryContext: onBeforeSendTelemetry changes the envelope props and sender gets them",
            test: function () {
                var nameOverride = "my unique name";
                var eventEnvelope = _this.getTestEventEnvelope();
                Assert.notEqual(eventEnvelope.name, nameOverride);
                var telemetryInitializer = {
                    initializer: function (envelope) {
                        envelope.name = nameOverride;
                        return true;
                    }
                };
                _this._telemetryContext.addTelemetryInitializer(telemetryInitializer.initializer);
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.calledOnce, "sender was called");
                Assert.ok(eventEnvelope === stub.args[0][0]);
                Assert.equal(nameOverride, stub.args[0][0].name);
                // teardown
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetryInitializers array is null (not initialized) means envelope goes straight to the sender",
            test: function () {
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.calledOnce, "sender was called");
                Assert.ok(eventEnvelope === stub.args[0][0]);
                // teardown
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer can modify the contents of an envelope",
            test: function () {
                var eventEnvelope = _this.getTestEventEnvelope();
                var telemetryInitializer = {
                    // This illustrates how to use telemetry initializer (onBeforeSendTelemetry) 
                    // to access/ modify the contents of an envelope.
                    init: function (envelope) {
                        envelope.deviceId = "my device id";
                        if (envelope.name ==
                            Microsoft.ApplicationInsights.Telemetry.Event.envelopeType) {
                            var telemetryItem = envelope.data.baseData;
                            telemetryItem.name = "my name";
                            telemetryItem.properties = telemetryItem.properties || {};
                            telemetryItem.properties["prop1"] = "val1";
                        }
                    }
                };
                _this._telemetryContext.addTelemetryInitializer(telemetryInitializer.init);
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.calledOnce, "sender should be called");
                Assert.equal("my device id", stub.args[0][0].deviceId);
                Assert.equal("my name", stub.args[0][0].data.baseData.name);
                Assert.equal("val1", stub.args[0][0].data.baseData.properties["prop1"]);
                // teardown
            }
        });
        this.testCase({
            name: "TelemetryContext: all added telemetry initializers get invoked",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var initializer1 = { init: function () { } };
                var initializer2 = { init: function () { } };
                var spy1 = _this.sandbox.spy(initializer1, "init");
                var spy2 = _this.sandbox.spy(initializer2, "init");
                // act
                _this._telemetryContext.addTelemetryInitializer(initializer1.init);
                _this._telemetryContext.addTelemetryInitializer(initializer2.init);
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(spy1.calledOnce);
                Assert.ok(spy2.calledOnce);
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer - returning false means don't send an item",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext.addTelemetryInitializer((function () { return false; }));
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.notCalled);
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer - returning void means do send an item (back compact with older telemetry initializers)",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext.addTelemetryInitializer((function () { return; }));
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.calledOnce);
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer - returning true means do send an item",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext.addTelemetryInitializer((function () { return true; }));
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.calledOnce);
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer - if one of initializers returns false than item is not sent",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext.addTelemetryInitializer((function () { return true; }));
                _this._telemetryContext.addTelemetryInitializer((function () { return false; }));
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.notCalled);
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer - if one of initializers returns false (any order) than item is not sent",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext.addTelemetryInitializer((function () { return false; }));
                _this._telemetryContext.addTelemetryInitializer((function () { return true; }));
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.notCalled);
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer - returning not boolean/undefined/null means do send an item (back compat with older telemetry initializers)",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext.addTelemetryInitializer((function () { return "asdf"; }));
                _this._telemetryContext.addTelemetryInitializer((function () { return null; }));
                _this._telemetryContext.addTelemetryInitializer((function () { return undefined; }));
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.calledOnce);
            }
        });
        this.testCase({
            name: "TelemetryContext: telemetry initializer - if one initializer fails then telemetry is not sent",
            test: function () {
                // prepare
                var eventEnvelope = _this.getTestEventEnvelope();
                var stub = _this.sandbox.stub(_this._telemetryContext._sender, "send");
                // act
                _this._telemetryContext.addTelemetryInitializer((function () { throw new Error(); }));
                _this._telemetryContext.addTelemetryInitializer((function () { }));
                _this._telemetryContext._track(eventEnvelope);
                // verify
                Assert.ok(stub.notCalled);
            }
        });
    };
    /**
    * Gets the sinon stub for telemetryContext.sample.isSampledIn function. Result is wrapped to an object
    * which has a counter of how many times the stub was accessed with expected envelope type.
    */
    TelemetryContextTests.prototype.getStub = function (envelopeType, telemetryContext) {
        var stub = {
            sinonStub: null,
            isSampledInCallsCount: 0
        };
        var isSampledInStub = this.sandbox.stub(telemetryContext.sample, "isSampledIn", function (envelope) {
            if (envelope.name === envelopeType) {
                ++stub.isSampledInCallsCount;
            }
        });
        stub.sinonStub = isSampledInStub;
        return stub;
    };
    TelemetryContextTests.prototype.getTestEventEnvelope = function (properties, measurements) {
        var event = new Microsoft.ApplicationInsights.Telemetry.Event('Test Event', properties, measurements);
        var eventData = new Microsoft.ApplicationInsights.Telemetry.Common.Data(Microsoft.ApplicationInsights.Telemetry.Event.dataType, event);
        var eventEnvelope = new Microsoft.ApplicationInsights.Telemetry.Common.Envelope(eventData, Microsoft.ApplicationInsights.Telemetry.Event.envelopeType);
        return eventEnvelope;
    };
    return TelemetryContextTests;
}(TestClass));
new TelemetryContextTests().registerTests();
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
/// <reference path="../../javascriptsdk/initialization.ts" />
/// <reference path="../../javascriptsdk/appinsights.ts" />
var InitializationTests = (function (_super) {
    __extends(InitializationTests, _super);
    function InitializationTests() {
        _super.apply(this, arguments);
    }
    InitializationTests.prototype.testInitialize = function () {
        window['queueTest'] = function () { };
    };
    InitializationTests.prototype.getAppInsightsSnippet = function () {
        var snippet = {
            instrumentationKey: "ffffffff-ffff-ffff-ffff-ffffffffffff",
            endpointUrl: "https://dc.services.visualstudio.com/v2/track",
            emitLineDelimitedJson: false,
            accountId: undefined,
            sessionRenewalMs: 10,
            sessionExpirationMs: 10,
            maxBatchSizeInBytes: 1000000,
            maxBatchInterval: 1,
            enableDebug: true,
            disableExceptionTracking: false,
            disableTelemetry: false,
            verboseLogging: true,
            diagnosticLogInterval: 1,
            autoTrackPageVisitTime: false,
            samplingPercentage: 33,
            disableAjaxTracking: true,
            overridePageViewDuration: false,
            maxAjaxCallsPerView: 44,
            disableDataLossAnalysis: true,
            disableCorrelationHeaders: false,
            disableFlushOnBeforeUnload: false,
            cookieDomain: undefined,
            enableSessionStorageBuffer: false
        };
        // set default values
        return snippet;
    };
    InitializationTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "InitializationTests: constructor throws if Instrumentation Key is not set",
            test: function () {
                var snippet = {};
                var msg = "";
                try {
                    var init = new Microsoft.ApplicationInsights.Initialization(snippet);
                }
                catch (err) {
                    msg = err.message;
                }
                Assert.equal("Cannot load Application Insights SDK, no instrumentationKey was provided.", msg);
            }
        });
        this.testCase({
            name: "InitializationTests: constructor sets defaults",
            test: function () {
                var emptyConfig = {
                    instrumentationKey: "ffffffff-ffff - ffff - ffff - ffffffffffff",
                    endpointUrl: undefined,
                    accountId: undefined,
                    sessionRenewalMs: undefined,
                    sessionExpirationMs: undefined,
                    maxBatchSizeInBytes: undefined,
                    maxBatchInterval: undefined,
                    enableDebug: undefined,
                    disableExceptionTracking: undefined,
                    disableTelemetry: undefined,
                    verboseLogging: undefined,
                    diagnosticLogInterval: undefined,
                    samplingPercentage: undefined,
                    maxAjaxCallsPerView: undefined
                };
                var snippet = {
                    config: emptyConfig,
                    queue: []
                };
                var init = new Microsoft.ApplicationInsights.Initialization(snippet);
                Assert.equal("https://dc.services.visualstudio.com/v2/track", init.config.endpointUrl);
                Assert.equal(30 * 60 * 1000, init.config.sessionRenewalMs);
                Assert.equal(24 * 60 * 60 * 1000, init.config.sessionExpirationMs);
                Assert.equal(102400, init.config.maxBatchSizeInBytes);
                Assert.equal(15000, init.config.maxBatchInterval);
                Assert.ok(!init.config.enableDebug);
                Assert.ok(!init.config.disableExceptionTracking);
                Assert.equal(15000, init.config.maxBatchInterval);
                Assert.ok(!init.config.verboseLogging);
                Assert.equal(10000, init.config.diagnosticLogInterval);
                Assert.equal(100, init.config.samplingPercentage);
                Assert.equal(500, init.config.maxAjaxCallsPerView);
            }
        });
        this.testCase({
            name: "InitializationTests: constructor takes the user specified values",
            test: function () {
                var userConfig = _this.getAppInsightsSnippet();
                var snippet = {
                    config: userConfig,
                    queue: []
                };
                var init = new Microsoft.ApplicationInsights.Initialization(snippet);
                Assert.equal(userConfig.endpointUrl, init.config.endpointUrl);
                Assert.equal(userConfig.sessionRenewalMs, init.config.sessionRenewalMs);
                Assert.equal(userConfig.sessionExpirationMs, init.config.sessionExpirationMs);
                Assert.equal(userConfig.maxBatchSizeInBytes, init.config.maxBatchSizeInBytes);
                Assert.equal(userConfig.maxBatchInterval, init.config.maxBatchInterval);
                Assert.ok(init.config.enableDebug);
                Assert.ok(!init.config.disableExceptionTracking);
                Assert.equal(1, init.config.maxBatchInterval);
                Assert.ok(init.config.verboseLogging);
                Assert.equal(1, init.config.diagnosticLogInterval);
                Assert.equal(33, init.config.samplingPercentage);
                Assert.equal(44, init.config.maxAjaxCallsPerView);
            }
        });
        this.testCase({
            name: "InitializationTests: invalid sampling values are treated as sampling OFF (sampling percentage gets set to 100)",
            test: function () {
                var res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: 0 });
                Assert.equal(100, res.samplingPercentage);
                res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: "" });
                Assert.equal(100, res.samplingPercentage);
                res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: null });
                Assert.equal(100, res.samplingPercentage);
                res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: undefined });
                Assert.equal(100, res.samplingPercentage);
                res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: false });
                Assert.equal(100, res.samplingPercentage);
                res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: -123 });
                Assert.equal(100, res.samplingPercentage);
                res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: 123 });
                Assert.equal(100, res.samplingPercentage);
                // "50" is treated as correct number and doesn't reset sampling percentage to 100.
                res = Microsoft.ApplicationInsights.Initialization.getDefaultConfig({ samplingPercentage: "50" });
                Assert.equal(50, res.samplingPercentage);
            }
        });
        this.testCase({
            name: "InitializationTests: polling for log messages",
            test: function () {
                var userConfig = _this.getAppInsightsSnippet();
                var snippet = {
                    config: userConfig,
                    queue: []
                };
                var init = new Microsoft.ApplicationInsights.Initialization(snippet);
                var appInsightsLocal = init.loadAppInsights();
                var trackTraceSpy = _this.sandbox.stub(appInsightsLocal, "trackTrace");
                var queue = Microsoft.ApplicationInsights._InternalLogging["queue"];
                var length = queue.length;
                for (var i = 0; i < length; i++) {
                    queue.shift();
                }
                queue.push(new Microsoft.ApplicationInsights._InternalLogMessage(1, "Hello1"));
                queue.push(new Microsoft.ApplicationInsights._InternalLogMessage(2, "Hello2"));
                init.loadAppInsights();
                var poller = init.pollInteralLogs(appInsightsLocal);
                _this.clock.tick(2);
                var data1 = trackTraceSpy.args[0][0];
                Assert.ok("Hello1", data1.message);
                var data2 = trackTraceSpy.args[1][0];
                Assert.ok("Hello2", data2.message);
                clearInterval(poller);
            }
        });
        this.testCase({
            name: "InitializationTests: in config - 'false' string is treated as a boolean false",
            test: function () {
                var userConfig = {
                    enableDebug: "false",
                    disableExceptionTracking: "false",
                    disableTelemetry: "false",
                    verboseLogging: "false",
                    emitLineDelimitedJson: "false",
                };
                var config = Microsoft.ApplicationInsights.Initialization.getDefaultConfig(userConfig);
                Assert.ok(!config.enableDebug);
                Assert.ok(!config.disableExceptionTracking);
                Assert.ok(!config.disableTelemetry);
                Assert.ok(!config.verboseLogging);
                Assert.ok(!config.emitLineDelimitedJson);
            }
        });
        this.testCase({
            name: "InitializationTests: in config - 'true' string is treated as a boolean true",
            test: function () {
                var userConfig = {
                    enableDebug: "true",
                    disableExceptionTracking: "true",
                    disableTelemetry: "true",
                    verboseLogging: "true",
                    emitLineDelimitedJson: "true",
                };
                var config = Microsoft.ApplicationInsights.Initialization.getDefaultConfig(userConfig);
                Assert.ok(config.enableDebug);
                Assert.ok(config.disableExceptionTracking);
                Assert.ok(config.disableTelemetry);
                Assert.ok(config.verboseLogging);
                Assert.ok(config.emitLineDelimitedJson);
            }
        });
        this.testCase({
            name: "InitializationTests: beforeunload handler is appropriately added",
            test: function () {
                // Assemble
                var userConfig = _this.getAppInsightsSnippet();
                var snippet = {
                    config: userConfig,
                    queue: []
                };
                var addEventHandlerStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, 'addEventHandler').returns(true);
                var init = new Microsoft.ApplicationInsights.Initialization(snippet);
                var appInsightsLocal = init.loadAppInsights();
                // Act
                init.addHousekeepingBeforeUnload(appInsightsLocal);
                // Assert
                Assert.ok(addEventHandlerStub.calledOnce);
                Assert.equal(addEventHandlerStub.getCall(0).args[0], 'beforeunload');
                Assert.ok(addEventHandlerStub.getCall(0).args[1] !== undefined, 'addEventHandler was called with undefined callback');
            }
        });
        this.testCase({
            name: "InitializationTests: disableFlushOnBeforeUnload switch works",
            test: function () {
                // Assemble
                var userConfig = _this.getAppInsightsSnippet();
                userConfig.disableFlushOnBeforeUnload = true;
                var snippet = {
                    config: userConfig,
                    queue: []
                };
                var addEventHandlerStub = _this.sandbox.stub(Microsoft.ApplicationInsights.Util, 'addEventHandler').returns(true);
                var init = new Microsoft.ApplicationInsights.Initialization(snippet);
                var appInsightsLocal = init.loadAppInsights();
                // Act
                init.addHousekeepingBeforeUnload(appInsightsLocal);
                // Assert
                Assert.ok(addEventHandlerStub.notCalled);
            }
        });
    };
    return InitializationTests;
}(TestClass));
new InitializationTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/ajax/ajax.ts" />
/// <reference path="../../JavaScriptSDK/Util.ts"/>
var AjaxTests = (function (_super) {
    __extends(AjaxTests, _super);
    function AjaxTests() {
        _super.apply(this, arguments);
        this.appInsightsMock = {
            trackDependency: function (id, method, absoluteUrl, isAsync, totalTime, success) { },
            context: {
                operation: {
                    id: "asdf"
                }
            },
            config: {
                disableCorrelationHeaders: false
            }
        };
    }
    AjaxTests.prototype.testInitialize = function () {
        this.trackDependencySpy = this.sandbox.spy(this.appInsightsMock, "trackDependency");
        this.callbackSpy = this.sandbox.spy();
        this.trackDependencySpy.reset();
        var xhr = sinon.useFakeXMLHttpRequest();
    };
    AjaxTests.prototype.testCleanup = function () {
    };
    AjaxTests.prototype.registerTests = function () {
        var _this = this;
        this.testCase({
            name: "Ajax: xhr.open gets instrumented",
            test: function () {
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                // act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "http://microsoft.com");
                // assert
                var ajaxData = xhr.ajaxData;
                Assert.equal("http://microsoft.com", ajaxData.requestUrl, "RequestUrl is collected correctly");
            }
        });
        this.testCase({
            name: "Ajax: successful request, ajax monitor doesn't change payload",
            test: function () {
                var callback = _this.sandbox.spy();
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                // Act
                var xhr = new XMLHttpRequest();
                xhr.onload = callback;
                xhr.open("GET", "/bla");
                xhr.send();
                Assert.ok(!_this.trackDependencySpy.called, "TrackAjax should not be called yet");
                // Emulate response
                xhr.respond(200, { "Content-Type": "application/json" }, "bla");
                Assert.ok(_this.trackDependencySpy.called, "TrackAjax is called");
                // Assert
                var result = callback.args[0][0].target;
                Assert.ok(callback.called, "Ajax callback is called");
                Assert.equal("bla", result.responseText, "Expected result mismatch");
                Assert.equal(200, result.status, "Expected 200 response code");
                Assert.equal(4, xhr.readyState, "Expected readyState is 4 after request is finished");
            }
        });
        this.testCase({
            name: "Ajax: custom onreadystatechange gets called",
            test: function () {
                var onreadystatechangeSpy = _this.sandbox.spy();
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                // Act
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = onreadystatechangeSpy;
                xhr.open("GET", "/bla");
                xhr.send();
                Assert.ok(!_this.trackDependencySpy.called, "TrackAjax should not be called yet");
                // Emulate response                
                xhr.respond();
                // Assert
                Assert.ok(_this.trackDependencySpy.called, "TrackAjax is called");
                Assert.ok(onreadystatechangeSpy.called, "custom onreadystatechange should be called");
            }
        });
        this.testCase({
            name: "Ajax: 200 means success",
            test: function () {
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                // Act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/bla");
                xhr.send();
                // Emulate response                
                xhr.respond(200, {}, "");
                // Assert
                Assert.equal(true, _this.trackDependencySpy.args[0][5], "TrackAjax should receive true as a 'success' argument");
            }
        });
        this.testCase({
            name: "Ajax: non 200 means failure",
            test: function () {
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                // Act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/bla");
                xhr.send();
                // Emulate response                
                xhr.respond(404, {}, "");
                // Assert
                Assert.equal(false, _this.trackDependencySpy.args[0][5], "TrackAjax should receive false as a 'success' argument");
            }
        });
        [200, 201, 202, 203, 204, 301, 302, 303, 304].forEach(function (responseCode) {
            _this.testCase({
                name: "Ajax: test success http response code: " + responseCode,
                test: function () {
                    _this.testAjaxSuccess(responseCode, true);
                }
            });
        });
        [400, 401, 402, 403, 404, 500, 501].forEach(function (responseCode) {
            _this.testCase({
                name: "Ajax: test failure http response code: " + responseCode,
                test: function () {
                    _this.testAjaxSuccess(responseCode, false);
                }
            });
        });
        this.testCase({
            name: "Ajax: overriding ready state change handlers in all possible ways",
            test: function () {
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                var cb1 = _this.sandbox.spy();
                var cb2 = _this.sandbox.spy();
                var cb3 = _this.sandbox.spy();
                var cb4 = _this.sandbox.spy();
                var cb5 = _this.sandbox.spy();
                var cb6 = _this.sandbox.spy();
                var cb7 = _this.sandbox.spy();
                // Act
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("readystatechange", cb1);
                xhr.addEventListener("readystatechange", cb2);
                xhr.open("GET", "/bla");
                xhr.onreadystatechange = cb3;
                xhr.addEventListener("readystatechange", cb4);
                xhr.addEventListener("readystatechange", cb5);
                xhr.send();
                xhr.addEventListener("readystatechange", cb6);
                xhr.addEventListener("readystatechange", cb7);
                Assert.ok(!_this.trackDependencySpy.called, "TrackAjax should not be called yet");
                // Emulate response                
                xhr.respond(404, {}, "");
                // Assert
                Assert.ok(_this.trackDependencySpy.calledOnce, "TrackAjax should be called");
                Assert.ok(cb1.called, "callback 1 should be called");
                Assert.ok(cb2.called, "callback 2 should be called");
                Assert.ok(cb3.called, "callback 3 should be called");
                Assert.ok(cb4.called, "callback 4 should be called");
                Assert.ok(cb5.called, "callback 5 should be called");
                Assert.ok(cb6.called, "callback 6 should be called");
                Assert.ok(cb7.called, "callback 7 should be called");
            }
        });
        this.testCase({
            name: "Ajax: test ajax duration is calculated correctly",
            test: function () {
                var initialPerformance = window.performance;
                try {
                    // Mocking window performance (sinon doesn't have it).
                    // tick() is similar to sinon's clock.tick()
                    window.performance = {
                        current: 0,
                        now: function () {
                            return this.current;
                        },
                        tick: function (ms) {
                            this.current += ms;
                        },
                        timing: initialPerformance.timing
                    };
                    var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                    // tick to set the initial time be non zero
                    window.performance.tick(23);
                    // Act
                    var xhr = new XMLHttpRequest();
                    var clock = _this.clock;
                    var expectedResponseDuration = 50;
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 3) {
                            window.performance.tick(expectedResponseDuration);
                        }
                    };
                    xhr.open("GET", "/bla");
                    xhr.send();
                    // Emulate response                
                    xhr.respond(404, {}, "");
                    // Assert
                    Assert.ok(_this.trackDependencySpy.calledOnce, "TrackAjax should be called");
                    Assert.equal(expectedResponseDuration, _this.trackDependencySpy.args[0][4], "Ajax duration should match expected duration");
                }
                finally {
                    window.performance = initialPerformance;
                }
            }
        });
        this.testCase({
            name: "Ajax: 2nd invokation of xhr.send doesn't cause send wrapper to execute 2nd time",
            test: function () {
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                var spy = _this.sandbox.spy(ajax, "sendHandler");
                // Act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/bla");
                xhr.send();
                try {
                    xhr.send();
                }
                catch (e) { }
                // Assert
                Assert.ok(spy.calledOnce, "sendPrefixInstrumentor should be called only once");
            }
        });
        this.testCase({
            name: "Ajax: 2 invokation of xhr.open() doesn't cause send wrapper to execute 2nd time",
            test: function () {
                var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(_this.appInsightsMock);
                var spy = _this.sandbox.spy(ajax, "openHandler");
                // Act
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/bla");
                try {
                    xhr.open("GET", "/bla");
                }
                catch (e) { }
                // Assert
                Assert.ok(spy.calledOnce, "sendPrefixInstrumentor should be called only once");
            }
        });
    };
    AjaxTests.prototype.testAjaxSuccess = function (responseCode, success) {
        var ajax = new Microsoft.ApplicationInsights.AjaxMonitor(this.appInsightsMock);
        // Act
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/bla");
        xhr.send();
        // Emulate response                
        xhr.respond(responseCode, {}, "");
        // Assert
        Assert.equal(success, this.trackDependencySpy.args[0][5], "TrackAjax should receive " + success + " as a 'success' argument");
    };
    return AjaxTests;
}(TestClass));
new AjaxTests().registerTests();
/// <reference path="..\TestFramework\Common.ts" />
/// <reference path="../../JavaScriptSDK/Util.ts" />
/// <reference path="../../JavaScriptSDK/SplitTest.ts" />
var SplitTestTests = (function (_super) {
    __extends(SplitTestTests, _super);
    function SplitTestTests() {
        _super.apply(this, arguments);
    }
    SplitTestTests.prototype.registerTests = function () {
        var getGuids = function (count) {
            var guids = [];
            for (var i = 0; i < count; ++i) {
                guids.push(Microsoft.ApplicationInsights.Util.newId());
            }
            return guids;
        };
        this.testCase({
            name: "SplitTestTests: ",
            test: function () {
                var sut = new Microsoft.ApplicationInsights.SplitTest();
                var guids = getGuids(10000);
                var enabledPercent = 20;
                var acceptedErrorPercent = 2;
                // Act
                var totalCount = guids.length;
                var enabledCount = 0;
                guids.forEach(function (guid) {
                    console.log(guid);
                    if (sut.isEnabled(guid, enabledPercent))
                        ++enabledCount;
                });
                // Validate
                var actualEnabledPercent = (enabledCount / totalCount) * 100;
                Assert.ok((actualEnabledPercent < enabledPercent + acceptedErrorPercent) &&
                    (actualEnabledPercent > enabledPercent - acceptedErrorPercent), "Enabled percent does not fall into expected range (" + enabledPercent + " +- " + acceptedErrorPercent + "): " + actualEnabledPercent);
            }
        });
    };
    return SplitTestTests;
}(TestClass));
new SplitTestTests().registerTests();
/// <reference path="../JavaScriptSDK.Interfaces/IConfig.ts"/>
/// <reference path="../JavaScriptSDK.Interfaces/IAppInsights.ts"/>
define("JavaScriptSDK.Module/AppInsightsModule", ["require", "exports"], function (require, exports) {
    "use strict";
    var AppInsightsModule = (function () {
        function AppInsightsModule() {
        }
        AppInsightsModule._createLazyMethod = function (name) {
            var aiObject = window[AppInsightsModule.appInsightsName];
            // Define a temporary method that queues-up a the real method call
            aiObject[name] = function () {
                // Capture the original arguments passed to the method
                var originalArguments = arguments;
                // If the queue is available, it means that the function wasn't yet replaced with actual function value
                if (aiObject.queue) {
                    aiObject.queue.push(function () { return aiObject[name].apply(aiObject, originalArguments); });
                }
                else {
                    // otherwise execute the function
                    aiObject[name].apply(aiObject, originalArguments);
                }
            };
        };
        ;
        AppInsightsModule._defineLazyMethods = function () {
            var aiObject = window[AppInsightsModule.appInsightsName];
            // capture initial cookie if possible
            try {
                aiObject.cookie = document.cookie;
            }
            catch (e) {
            }
            aiObject.queue = [];
            var method = [
                "clearAuthenticatedUserContext",
                "flush",
                "setAuthenticatedUserContext",
                "startTrackEvent",
                "startTrackPage",
                "stopTrackEvent",
                "stopTrackPage",
                "trackDependency",
                "trackEvent",
                "trackException",
                "trackMetric",
                "trackPageView",
                "trackTrace"
            ];
            while (method.length) {
                AppInsightsModule._createLazyMethod(method.pop());
            }
        };
        AppInsightsModule._download = function (aiConfig) {
            AppInsightsModule.appInsightsInstance.config = aiConfig;
            var aiObject = window[AppInsightsModule.appInsightsName];
            // if script was previously downloaded and initialized, queue will be deleted, reinitialize it
            if (!aiObject.queue) {
                aiObject.queue = [];
            }
            var scriptElement = document.createElement("script");
            scriptElement.src = aiConfig.url || "https://az416426.vo.msecnd.net/scripts/a/ai.0.js";
            document.head.appendChild(scriptElement);
            // collect global errors
            if (!aiConfig.disableExceptionTracking) {
                AppInsightsModule._createLazyMethod("_onerror");
                var originalOnError = window["_onerror"];
                window["_onerror"] = function (message, url, lineNumber, columnNumber, error) {
                    var handled = originalOnError && originalOnError(message, url, lineNumber, columnNumber, error);
                    if (handled !== true) {
                        aiObject["_onerror"](message, url, lineNumber, columnNumber, error);
                    }
                    return handled;
                };
            }
        };
        Object.defineProperty(AppInsightsModule, "appInsightsInstance", {
            get: function () {
                if (!window[AppInsightsModule.appInsightsName]) {
                    window[AppInsightsModule.appInsightsName] = {
                        downloadAndSetup: AppInsightsModule._download,
                        // exposing it for unit tests only, not part of interface
                        _defineLazyMethods: AppInsightsModule._defineLazyMethods
                    };
                    AppInsightsModule._defineLazyMethods();
                }
                return window[AppInsightsModule.appInsightsName];
            },
            enumerable: true,
            configurable: true
        });
        AppInsightsModule.appInsightsInitialized = false;
        AppInsightsModule.appInsightsName = "appInsights";
        return AppInsightsModule;
    }());
    exports.AppInsights = AppInsightsModule.appInsightsInstance;
});
/// <reference path="..\TestFramework\Common.ts" />
define("JavaScriptSDK.Tests/CheckinTests/AppInsightsModule.Tests", ["require", "exports", "JavaScriptSDK.Module/AppInsightsModule"], function (require, exports, AppInsightsModule_1) {
    "use strict";
    var AppInsightsModuleTests = (function (_super) {
        __extends(AppInsightsModuleTests, _super);
        function AppInsightsModuleTests() {
            _super.apply(this, arguments);
        }
        AppInsightsModuleTests.getUncachedScriptUrl = function () {
            return "https://az416426.vo.msecnd.net/scripts/a/ai.0.js?s=" + (new Date()).getTime().toString();
        };
        AppInsightsModuleTests.prototype.testInitialize = function () {
            // this is a workaround to force re-initialized of imported variable
            AppInsightsModule_1.AppInsights["_defineLazyMethods"]();
        };
        AppInsightsModuleTests.prototype.registerTests = function () {
            var _this = this;
            this.useFakeTimers = false;
            this.testCaseAsync({
                name: "AppInsightsModuleTests: downloadAndSetup",
                steps: [
                    function () {
                        Assert.ok(AppInsightsModule_1.AppInsights.queue, "Queue should initially be defined");
                        // need to override the url, otherwise file:// is used for local test runs.
                        AppInsightsModule_1.AppInsights.downloadAndSetup({ instrumentationKey: "test", url: AppInsightsModuleTests.getUncachedScriptUrl() });
                    },
                    PollingAssert.createPollingAssert(function () { return !AppInsightsModule_1.AppInsights.queue; }, "Queue object is cleaned and removed after script loads")
                ],
                stepDelay: 0
            });
            this.testCase({
                name: "AppInsightsModuleTests: verify methods are registered",
                test: function () {
                    AppInsightsModule_1.AppInsights.downloadAndSetup({ instrumentationKey: "test" });
                    for (var i = 0; i < AppInsightsModuleTests.expectedMethods.length; i++) {
                        Assert.ok(AppInsightsModule_1.AppInsights[AppInsightsModuleTests.expectedMethods[i]], AppInsightsModuleTests.expectedMethods[i] + " should be defined");
                    }
                }
            });
            this.testCaseAsync({
                name: "AppInsightsModuleTests: verifying queue is flushed when loading",
                steps: [
                    function () {
                        AppInsightsModule_1.AppInsights.downloadAndSetup({ instrumentationKey: "test", url: AppInsightsModuleTests.getUncachedScriptUrl() });
                        AppInsightsModule_1.AppInsights.queue.push(function () { return _this["queueFlushed"] = true; });
                        _this["queueFlushed"] = false;
                    },
                    PollingAssert.createPollingAssert(function () { return _this["queueFlushed"] === true; }, "Actions in the queue are executed when queue is flushed")
                ],
                stepDelay: 0
            });
            this.testCase({
                name: "AppInsightsModuleTests: verify track* methods are defined before calling downloadAndSetup",
                test: function () {
                    for (var i = 0; i < AppInsightsModuleTests.expectedMethods.length; i++) {
                        Assert.ok(AppInsightsModule_1.AppInsights[AppInsightsModuleTests.expectedMethods[i]], AppInsightsModuleTests.expectedMethods[i] + " should be defined");
                    }
                }
            });
            this.testCase({
                name: "AppInsightsModuleTests: verify track* method calls called before downloadAndSetup end up in the queue",
                test: function () {
                    AppInsightsModule_1.AppInsights.trackTrace("");
                    AppInsightsModule_1.AppInsights.trackEvent("");
                    AppInsightsModule_1.AppInsights.trackTrace("");
                    Assert.equal(3, AppInsightsModule_1.AppInsights.queue.length);
                    AppInsightsModule_1.AppInsights.downloadAndSetup({ instrumentationKey: "test", url: AppInsightsModuleTests.getUncachedScriptUrl() });
                    Assert.equal(3, AppInsightsModule_1.AppInsights.queue.length);
                }
            });
        };
        AppInsightsModuleTests.expectedMethods = [
            "clearAuthenticatedUserContext",
            "flush",
            "setAuthenticatedUserContext",
            "startTrackEvent",
            "startTrackPage",
            "stopTrackEvent",
            "stopTrackPage",
            "trackDependency",
            "trackEvent",
            "trackException",
            "trackMetric",
            "trackPageView",
            "trackTrace"
        ];
        return AppInsightsModuleTests;
    }(TestClass));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AppInsightsModuleTests;
});
/// <reference path="../checkintests/appinsights.tests.ts" />
/// <reference path="../checkintests/context/HashCodeScoreGenerator.tests.ts" />
/// <reference path="../checkintests/context/sample.tests.ts" />
/// <reference path="../checkintests/context/user.tests.ts" />
/// <reference path="../checkintests/context/session.tests.ts" />
define("JavaScriptSDK.Tests/Selenium/checkinTests", ["require", "exports", "JavaScriptSDK.Tests/CheckinTests/AppInsightsModule.Tests"], function (require, exports, AppInsightsModule_Tests_1) {
    "use strict";
    function registerTests() {
        /* for every module call registerTests() */
        new AppInsightsModule_Tests_1.default().registerTests();
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = registerTests;
});
