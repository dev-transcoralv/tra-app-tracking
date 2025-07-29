/* eslint-disable no-unused-expressions */
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ReactNode } from "react";

export const FontAwesomeEye = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="eye" color="white" size={24} {...props} />;
};

export const FontAwesomeEyeOff = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="eye-slash" color="white" size={24} {...props} />;
};
