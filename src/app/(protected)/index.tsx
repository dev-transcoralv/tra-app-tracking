import { Button, View } from "react-native";
import { ListOrders } from "../../components/orders/_List";
import { getListOrders } from "../../services/odoo/order";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../utils/authContext";
import { Order } from "../../shared.types";

export default function IndexScreen() {
  const authContext = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getListOrders(1000).then((orders) => {
      setOrders(orders);
    });
  }, []);
  return (
    <View>
      <ListOrders orders={orders} />
      <Button onPress={() => authContext.logOut()} title="Logout" />
    </View>
  );
}
