import datetime as dt
import json
from os import getcwd
import dash
import pandas as pd
import numpy as np
from requests import Response
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt


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

    # --------------------------------------------------
    # @ ommited plotting code
    # --------------------------------------------------

    # app = dash.Dash()
    # app.layout = html.Div([
    #   html.H1("Stock Price Analysis Dashboard", style={"textAlign": "center"}),
    #   dcc.Tabs(id="tabs", children=[
    #     dcc.Tab(label='NSE-TATAGLOBAL Stock Data', children=[
    #       html.Div([
    #         html.H2("Actual closing price", style={"textAlign": "center"}),
    #         dcc.Graph(
    #           id="Actual Data",
    #           figure={
    #             "data": [
    #               go.Scatter(
    #                 x=train.index,
    #                 y=valid["Close"],
    #                 mode='markers'
    #               )
    #             ],
    #             "layout":go.Layout(
    #               title='scatter plot',
    #               xaxis={'title': 'Date'},
    #               yaxis={'title': 'Closing Rate'}
    #             )
    #           }
    #         ),
    #         html.H2("LSTM Predicted closing price", style={"textAlign": "center"}),
    #         dcc.Graph(
    #           id="Predicted Data",
    #           figure={
    #             "data": [
    #               go.Scatter(x=valid.index, y=valid["Predictions"], mode='markers')
    #             ],
    #             "layout":go.Layout(
    #               title='scatter plot',
    #               xaxis={'title': 'Date'},
    #               yaxis={'title': 'Closing Rate'}
    #             )
    #           }
    #         )
    #       ])
    #     ]),
    #     dcc.Tab(label='Facebook Stock Data', children=[
    #       html.Div([
    #         html.H1("Stocks High vs Lows", style={'textAlign': 'center'}),
    #         dcc.Dropdown(id='my-dropdown',
    #           options=[{'label': 'Tesla', 'value': 'TSLA'},
    #                   {'label': 'Apple', 'value': 'AAPL'},
    #                   {'label': 'Facebook', 'value': 'FB'},
    #                   {'label': 'Microsoft', 'value': 'MSFT'}],
    #           multi=True, value=['FB'],
    #           style={"display": "block", "margin-left": "auto",
    #                 "margin-right": "auto", "width": "60%"}),
    #         dcc.Graph(id='highlow'),
    #         html.H1("Stocks Market Volume", style={'textAlign': 'center'}),

    #         dcc.Dropdown(id='my-dropdown2',
    #           options=[{'label': 'Tesla', 'value': 'TSLA'},
    #                   {'label': 'Apple', 'value': 'AAPL'},
    #                   {'label': 'Facebook', 'value': 'FB'},
    #                   {'label': 'Microsoft', 'value': 'MSFT'}],
    #           multi=True, value=['FB'],
    #           style={"display": "block", "margin-left": "auto",
    #                 "margin-right": "auto", "width": "60%"}),
    #         dcc.Graph(id='volume')
    #       ], className="container"),
    #     ])
    #   ])
    # ])

    # @app.callback(Output('highlow', 'figure'),
    #               [Input('my-dropdown', 'value')])
    # def update_graph(selected_dropdown):
    #     dropdown = {"TSLA": "Tesla", "AAPL": "Apple","FB": "Facebook", "MSFT": "Microsoft", }
    #     trace1 = []
    #     trace2 = []
    #     for stock in selected_dropdown:
    #         trace1.append(
    #             go.Scatter(x=df[df["Stock"] == stock]["Date"],
    #                         y=df[df["Stock"] == stock]["High"],
    #                         mode='lines', opacity=0.7,
    #                         name=f'High {dropdown[stock]}', textposition='bottom center'))
    #         trace2.append(
    #             go.Scatter(x=df[df["Stock"] == stock]["Date"],
    #                         y=df[df["Stock"] == stock]["Low"],
    #                         mode='lines', opacity=0.6,
    #                         name=f'Low {dropdown[stock]}', textposition='bottom center'))
    #     traces = [trace1, trace2]
    #     data = [val for sublist in traces for val in sublist]
    #     figure = {'data': data,
    #               'layout': go.Layout(colorway=["#5E0DAC", '#FF4F00', '#375CB1',
    #                                             '#FF7400', '#FFF400', '#FF0056'],
    #                                   height=600,
    #                                   title=f"High and Low Prices for {', '.join(str(dropdown[i]) for i in selected_dropdown)} Over Time",
    #                                   xaxis={"title": "Date",
    #                                           'rangeselector': {'buttons': list([{'count': 1, 'label': '1M',
    #                                                                             'step': 'month',
    #                                                                               'stepmode': 'backward'},
    #                                                                             {'count': 6, 'label': '6M',
    #                                                                             'step': 'month',
    #                                                                             'stepmode': 'backward'},
    #                                                                             {'step': 'all'}])},
    #                                           'rangeslider': {'visible': True}, 'type': 'date'},
    #                                   yaxis={"title": "Price (USD)"})}
    #     return figure

    # @app.callback(Output('volume', 'figure'),
    #               [Input('my-dropdown2', 'value')])
    # def update_graph(selected_dropdown_value):
    #     dropdown = {"TSLA": "Tesla", "AAPL": "Apple",
    #                 "FB": "Facebook", "MSFT": "Microsoft", }
    #     trace1 = []
    #     for stock in selected_dropdown_value:
    #         trace1.append(
    #             go.Scatter(x=df[df["Stock"] == stock]["Date"],
    #                         y=df[df["Stock"] == stock]["Volume"],
    #                         mode='lines', opacity=0.7,
    #                         name=f'Volume {dropdown[stock]}', textposition='bottom center'))
    #     traces = [trace1]
    #     data = [val for sublist in traces for val in sublist]
    #     figure = {'data': data,
    #               'layout': go.Layout(colorway=["#5E0DAC", '#FF4F00', '#375CB1',
    #                                             '#FF7400', '#FFF400', '#FF0056'],
    #                                   height=600,
    #                                   title=f"Market Volume for {', '.join(str(dropdown[i]) for i in selected_dropdown_value)} Over Time",
    #                                   xaxis={"title": "Date",
    #                                           'rangeselector': {'buttons': list([{'count': 1, 'label': '1M',
    #                                                                             'step': 'month',
    #                                                                               'stepmode': 'backward'},
    #                                                                             {'count': 6, 'label': '6M',
    #                                                                             'step': 'month',
    #                                                                             'stepmode': 'backward'},
    #                                                                             {'step': 'all'}])},
    #                                           'rangeslider': {'visible': True}, 'type': 'date'},
    #                                   yaxis={"title": "Transactions Volume"})}
    #     return figure
    # app.run_server(debug=True)


if __name__ == '__main__':
    main('01')
else:
    flaskApp = Flask(__name__)

    @flaskApp.get("/<string:user_id>")
    def get_predictions(user_id: str):
        # write 'hello world' in hello.txt
        with open(f'{app_path}\\hello.txt', 'w') as f:
            f.write('hello world')
            f.close()
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
