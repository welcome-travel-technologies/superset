"use strict";

var _guestTokenRefresh = require("./guestTokenRefresh");
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

describe("guest token refresh", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern"); // "modern" allows us to fake the system time
    jest.setSystemTime(new Date("2022-03-03 01:00"));
    jest.spyOn(global, "setTimeout");
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  function makeFakeJWT(claims) {
    // not a valid jwt, but close enough for this code
    const tokenifiedClaims = Buffer.from(JSON.stringify(claims)).toString("base64");
    return `abc.${tokenifiedClaims}.xyz`;
  }
  it("schedules refresh with an epoch exp", () => {
    // exp is in seconds
    const ttl = 1300;
    const exp = Date.now() / 1000 + ttl;
    const fakeToken = makeFakeJWT({
      exp
    });
    const timing = (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(fakeToken);
    expect(timing).toBeGreaterThan(_guestTokenRefresh.MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(ttl * 1000 - _guestTokenRefresh.REFRESH_TIMING_BUFFER_MS);
  });
  it("schedules refresh with an epoch exp containing a decimal", () => {
    const ttl = 1300.123;
    const exp = Date.now() / 1000 + ttl;
    const fakeToken = makeFakeJWT({
      exp
    });
    const timing = (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(fakeToken);
    expect(timing).toBeGreaterThan(_guestTokenRefresh.MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(ttl * 1000 - _guestTokenRefresh.REFRESH_TIMING_BUFFER_MS);
  });
  it("schedules refresh with iso exp", () => {
    const exp = new Date("2022-03-03 01:09").toISOString();
    const fakeToken = makeFakeJWT({
      exp
    });
    const timing = (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(fakeToken);
    const expectedTiming = 1000 * 60 * 9 - _guestTokenRefresh.REFRESH_TIMING_BUFFER_MS;
    expect(timing).toBeGreaterThan(_guestTokenRefresh.MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(expectedTiming);
  });
  it("avoids refresh spam", () => {
    const fakeToken = makeFakeJWT({
      exp: Date.now() / 1000
    });
    const timing = (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(fakeToken);
    expect(timing).toBe(_guestTokenRefresh.MIN_REFRESH_WAIT_MS - _guestTokenRefresh.REFRESH_TIMING_BUFFER_MS);
  });
  it("uses a default when it cannot parse the date", () => {
    const fakeToken = makeFakeJWT({
      exp: "invalid date"
    });
    const timing = (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(fakeToken);
    expect(timing).toBeGreaterThan(_guestTokenRefresh.MIN_REFRESH_WAIT_MS);
    expect(timing).toBe(_guestTokenRefresh.DEFAULT_TOKEN_EXP_MS - _guestTokenRefresh.REFRESH_TIMING_BUFFER_MS);
  });
});
//# sourceMappingURL=guestTokenRefresh.test.js.map