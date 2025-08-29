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

export const FontAwesomePlus = ({
  color = "white",
  size = 24,
}: {
  color: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="plus" color={color} size={size} />;
};

export const FontAwesomePlay = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="play" color="#white" size={24} {...props} />;
};

export const FontAwesomeStop = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="stop" color={color} size={size} />;
};

export const FontAwesomeFilter = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="filter" color={color} size={size} />;
};

export const FontAwesomeEdit = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="edit" color={color} size={size} />;
};

export const FontAwesomeTrash = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="trash" color={color} size={size} />;
};

export const FontAwesomeUserCircle = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="user-circle" color={color} size={size} />;
};
