import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from "../utils/authContext";
import { useContext, useState } from "react";
import { FontAwesomeEye, FontAwesomeEyeOff } from "../components/Icons";

type FormData = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordView = () => setShowPassword(!showPassword);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      authContext.logIn(data.username, data.password);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Capture in notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full flex flex-col gap-4">
      <View className="w-full flex items-center gap-2 bg-secondary-complementary p-2">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Usuario"
              autoFocus
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#211915"
              className="color-secondary bg-transparent border-0 w-full outline-none text-sm md:text-base"
            />
          )}
          name="username"
        />
      </View>
      {errors.username && (
        <Text className="font-bold" style={styles.error}>
          Este campo es requerido.
        </Text>
      )}
      <View className="w-full flex-row items-center gap-2 bg-secondary-complementary p-2 relative">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Contraseña"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showPassword}
              placeholderTextColor="#211915"
              className="color-secondary flex-1 bg-transparent border-0 w-full outline-none text-sm md:text-base"
            />
          )}
          name="password"
        />
        <TouchableOpacity onPress={() => togglePasswordView()}>
          {showPassword ? (
            <FontAwesomeEyeOff props={{ size: 10, color: "#211915" }} />
          ) : (
            <FontAwesomeEye props={{ size: 10, color: "#211915" }} />
          )}
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text className="font-bold" style={styles.error}>
          Este campo es requerido.
        </Text>
      )}
      <TouchableOpacity
        className="mb-2 px-5 py-3 items-center bg-primary"
        onPress={handleSubmit(onSubmit)}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="items-center font-bold color-white text-lg">
            INGRESAR
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: "#e10718",
  },
});
