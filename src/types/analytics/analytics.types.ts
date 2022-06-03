export interface RawStock {
  Date: Date;
  Close: number;
}

export interface Stock {
  date: Date;
  close: number;
}

export function _camelizeStock(rawStock: RawStock): Stock {
  return {
    date: rawStock.Date,
    close: rawStock.Close,
  };
}
