/* eslint-disable import/first */
process.env.TWILIO_ACCOUNT_SID = 'AC91d53aa8880d2003bbbcf33673784b6a';
process.env.TWILIO_API_KEY_SID = 'SKa0a8ce9b75dfb722b068750b612129e5';
process.env.TWILIO_API_KEY_SECRET = '4FslYQc75YfQNuJxjunqtWuaJXcvurii';
process.env.TWILIO_CONVERSATIONS_SERVICE_SID = 'ISc7542985a4a4402e9f5162eca6c640dd';

import { createExpressHandler } from '../createExpressHandler';
import { ServerlessFunction } from '../types';
import Twilio from 'twilio';

jest.mock('twilio', () => jest.fn(() => 'mockTwilioClient'));

const mockRequest: any = {
  body: {
    foo: 'bar',
  },
};

const mockResponse: any = {
  status: jest.fn(() => mockResponse),
  set: jest.fn(() => mockResponse),
  json: jest.fn(),
};

describe('the createExpressHandler function', () => {
  afterEach(jest.clearAllMocks);

  it('should correctly initialize a Twilio client', () => {
    expect(Twilio).toHaveBeenCalledWith('mockApiKeySid', 'mockApiKeySecret', { accountSid: 'mockAccountSid' });
  });

  it('should pass the correct context object, event object, and callback function to the serverless funtion', () => {
    const mockServerlessFunction: ServerlessFunction = (context, event, callback) => {
      expect(context).toEqual({
        ACCOUNT_SID: 'mockAccountSid',
        CONVERSATIONS_SERVICE_SID: 'mockConversationsServiceSid',
        ROOM_TYPE: 'group',
        TWILIO_API_KEY_SECRET: 'mockApiKeySecret',
        TWILIO_API_KEY_SID: 'mockApiKeySid',
        getTwilioClient: expect.any(Function),
      });

      expect(context.getTwilioClient()).toEqual('mockTwilioClient');
      expect(event).toEqual({ foo: 'bar' });
      expect(callback).toEqual(expect.any(Function));
    };

    const expressHandler = createExpressHandler(mockServerlessFunction);
    expressHandler(mockRequest, mockResponse);
  });

  it('should call the correct express methods when the callback is called with a TwilioResponse object', () => {
    const mockServerlessFunction: ServerlessFunction = (_, __, callback) => {
      const mockTwilioResponse: any = {
        body: { foo: 'bar' },
        statusCode: 401,
        headers: { mockHeader: '123' },
      };

      callback(null, mockTwilioResponse);
    };

    const expressHandler = createExpressHandler(mockServerlessFunction);
    expressHandler(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.set).toHaveBeenCalledWith({ mockHeader: '123' });
    expect(mockResponse.json).toHaveBeenCalledWith({ foo: 'bar' });
  });
});
