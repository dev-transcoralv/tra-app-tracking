import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { ReactNode } from "react";

// TODO: Review props 'color'
export const FontAwesomeEye = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="eye" color="#211915" size={24} {...props} />;
};

export const FontAwesomeEyeOff = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="eye-slash" color="#211915" size={24} {...props} />;
};

export const FontAwesome5Route = (props: { props?: any }): ReactNode => {
  return <FontAwesome5 name="route" color="black" size={24} {...props} />;
};

export const FontAwesomeDashboard = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="dashboard" color="#e10718" size={24} {...props} />;
};

export const FontAwesomeList = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="list" color="#e10718" size={24} {...props} />;
};

export const FontAwesomeUser = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="user" color="#e10718" size={24} {...props} />;
};

export const FontAwesomeCamera = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="camera" color="#white" size={24} {...props} />;
};
