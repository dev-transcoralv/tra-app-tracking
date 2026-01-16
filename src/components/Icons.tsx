import { FontAwesome } from "@expo/vector-icons";
import { ReactNode } from "react";

export const FontAwesomeEye = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="eye" color="#211915" size={24} {...props} />;
};

export const FontAwesomeEyeOff = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="eye-slash" color="#211915" size={24} {...props} />;
};

export const FontAwesome5Route = (props: { props?: any }): ReactNode => {
  return <FontAwesome name="map-marker" color="black" size={24} {...props} />;
};

export const FontAwesomeDashboard = ({
  color = "white",
  size = 24,
}: {
  color: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="dashboard" color={color} size={size} />;
};

export const FontAwesomeList = ({
  color = "white",
  size = 24,
}: {
  color: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="list" color={color} size={size} />;
};

export const FontAwesomeOperative = ({
  color = "white",
  size = 24,
}: {
  color: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="truck" color={color} size={size} />;
};

export const FontAwesomeUmbrellaBeach = ({
  color = "white",
  size = 24,
}: {
  color: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="plane" color={color} size={size} />;
};

export const FontAwesomeUser = ({
  color = "white",
  size = 24,
}: {
  color: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="user" color={color} size={size} />;
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

export const FontAwesomePlay = ({
  color = "white",
  size = 24,
}: {
  color: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="play" color={color} size={size} />;
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

export const FontAwesomeSearch = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="search" color={color} size={size} />;
};

export const FontAwesomeSave = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="save" color={color} size={size} />;
};

export const FontAwesomeMinus = ({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}): ReactNode => {
  return <FontAwesome name="minus" color={color} size={size} />;
};
