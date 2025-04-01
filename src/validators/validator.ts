import { ValidatorReturn } from "../types";

export const isUsername = (value: string): ValidatorReturn => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!value) {
    return {
      res: false,
      msg: `Username is mandatory`,
    };
  }
  if (!regex.exec(value)) {
    return {
      res: false,
      msg: `Username is invalid`,
    };
  }
  return {
    res: true,
    msg: `Username is Correct`,
  };
};

export const isPassword = (value: string): ValidatorReturn => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  if (!value) {
    return {
      res: false,
      msg: `Password is mandatory`,
    };
  }
  if (value.length < 8) {
    return {
      res: false,
      msg: `Password must have least 8 characters`,
    };
  }
  if (value.search(/[0-9]/) < 0) {
    return {
      res: false,
      msg: `Password must contain at least one digit.`,
    };
  }
  if (value.search(/[A-Z]/) < 0) {
    return {
      res: false,
      msg: `Password must have one Uppercase letter.`,
    };
  }
  if (!regex.exec(value)) {
    return {
      res: false,
      msg: `Password must have one special character.`,
    };
  }
  return {
    res: true,
    msg: `Password is Correct`,
  };
};

export const isName = (value: string): ValidatorReturn => {
  const regex =
    /^[a-zA-Z]([a-zA-Z]([-']?[a-zA-Z]+)*)*( [a-zA-Z]([a-zA-Z]([-']?[a-zA-Z]+)*)*)*$/;

  if (!value) {
    return {
      res: false,
      msg: `Name is mandatory`,
    };
  }
  if (value.length < 3) {
    return {
      res: false,
      msg: `Name should have at least 3 characters.`,
    };
  }
  if (value.search(/[0-9]/)>0) {
    return {
      res: false,
      msg: `Name should not contain digits.`,
    };
  }
  if((/[^a-zA-Z0-9'\s-]/).exec(value)){
    return {
      res: false,
      msg: `Name should not contain symbols.`,
    };
  }
  if (!regex.exec(value.trim())) {
    return {
      res: false,
      msg: `Invalid name format`,
    };
  }
  return {
    res: true,
    msg: `Name is Correct`,
  };
};

export const isMobileNo = (value: string): ValidatorReturn => {
  const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

  if (!value) {
    return {
      res: false,
      msg: `Mobile No. is mandatory`,
    };
  }
  if (!(/^[0-9\s]+$/).exec(value)) {
    return {
      res: false,
      msg: `Mobile No. should not contain symbol and letters.`,
    };
  }
  if (value.length < 10) {
    return {
      res: false,
      msg: `Mobile No. should have 10 digits`,
    };
  }
  if (!regex.exec(value)) {
    return {
      res: false,
      msg: `Not a Indian mobile No.`,
    };
  }
  return {
    res: true,
    msg: `Mobile No is Correct`,
  };
};
