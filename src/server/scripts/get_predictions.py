import json
from os import getcwd
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
# import matplotlib.pyplot as plt


from flask import Flask, jsonify

app_path = f'{getcwd()}\\src\\server\\scripts'


def main(user_id: str):
    # --------------------------------------------------
    # @ Set-up model and data transformation
    # --------------------------------------------------

    # load and validate csv
    input_df = pd.read_csv(f'{app_path}\\analytics{user_id}.csv')
    input_df = input_df.filter(['Date', 'Close'])

    # check number of columns
    if len(input_df.columns) != 2:
        raise TypeError('Invalid number of columns.<br><strong>"Close"</strong> and <strong>"Date"</strong> are required.')

    for index, row in input_df.iterrows():
        if not isinstance(row['Close'], float):
            raise TypeError('Invalid close format.<br>Close must be a <strong>number</strong>.')

    model = load_model(f'{app_path}\\saved_lstm_model.h5')
    scaler = MinMaxScaler(feature_range=(0, 1))

    # convert str data to TimeStamp
    input_df["Date"] = pd.to_datetime(input_df.Date, format="%Y-%m-%d")
    # set date as index
    input_df.index = input_df['Date']
    # order by date
    data = input_df.sort_index(ascending=True, axis=0)
    new_data = pd.DataFrame(index=range(0, len(input_df)),
                            columns=['Date', 'Close'])
    # pass data to new_data
    for i in range(0, len(data)):
        new_data["Date"][i] = data['Date'][i]
        new_data["Close"][i] = data["Close"][i]
    # order and drop date again
    new_data.index = new_data.Date
    new_data.drop("Date", axis=1, inplace=True)
    # convert df to ndarray (exclude column names)
    dataset = new_data.values
    sixth_percent = int(len(dataset) * 0.8)
    # split into train and test sets
    train = dataset[0:sixth_percent, :]  # first 60% of data used for training
    valid = dataset[sixth_percent:, :]  # last 40% of data used for validation
    # scale data to 0-1 range for training
    scaled_data = scaler.fit_transform(dataset)

    # --------------------------------------------------
    # @ Perform training? and prediction
    # --------------------------------------------------

    # TODO - improve training and documentation

    x_train, y_train = [], []

    for i in range(60, len(train)):
        x_train.append(scaled_data[i-60:i, 0])
        y_train.append(scaled_data[i, 0])

    x_train, y_train = np.array(x_train), np.array(y_train)

    # reshape data to be 3D [samples, timesteps, features] ???
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

    inputs = new_data[sixth_percent-60:].values
    # reshape to 1D array (-1 = unknown-length/automatic-length)
    inputs = inputs.reshape(-1, 1)
    inputs = scaler.transform(inputs)

    X_test = []

    for i in range(60, inputs.shape[0]):
        X_test.append(inputs[i-60:i, 0])
    X_test = np.array(X_test)

    X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
    closing_price = model.predict(X_test)
    closing_price = scaler.inverse_transform(closing_price)

    # convert to df again
    complete = new_data
    train = new_data[:sixth_percent]
    valid = new_data[sixth_percent:]
    valid['Predictions'] = closing_price

    # --------------------------------------------------
    # @ Convert data to flask response
    # --------------------------------------------------

    # use dictionary for json response
    response_dict = {}

    # move index into Date
    comp_copy = complete.copy()
    train_copy = train.copy()
    valid_copy = valid.copy()

    comp_copy['Date'] = comp_copy.index
    train_copy['Date'] = train_copy.index
    valid_copy['Date'] = valid_copy.index
    # add data to dict
    response_dict['complete'] = comp_copy.to_json(orient='records')
    response_dict['train'] = train_copy.to_json(orient='records')
    response_dict['valid'] = valid_copy.to_json(orient='records')

    # enable to plot data

    # plt.figure(1)
    # plt.plot(valid.index, valid['Predictions'])
    # plt.xlabel('Date')
    # plt.ylabel('Close Price')
    # plt.title('Predictions')
    # plt.figure(2)
    # plt.plot(complete.index, complete['Close'])
    # plt.xlabel('Date')
    # plt.ylabel('Close Price')
    # plt.title('Actual')

    # plt.show()

    return jsonify(response_dict)

if __name__ == '__main__':
    main('01')
else:
    flaskApp = Flask(__name__)

    @flaskApp.get("/<string:user_id>")
    def get_predictions(user_id: str):
        try:
            return main(user_id)
        except ValueError as e:
            if (str(e).__contains__('time data')):
                return flaskApp.response_class(
                    response=json.dumps({'error': str(e)}),
                    status=400,
                    mimetype='application/json'
                )
            else:
                raise e
        except TypeError as er:
            if (str(er).__contains__('close format') | str(er).__contains__('number of columns')):
                return flaskApp.response_class(
                    response=json.dumps({'error': str(er)}),
                    status=400,
                    mimetype='application/json'
                )
            else:
                raise er
