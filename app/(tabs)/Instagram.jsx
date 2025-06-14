import { StyleSheet, Text, View } from "react-native";
import InstagramFeed from "../../components/InstagramFeed";

export default function InstagramPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram</Text>
      </View>
      
      <InstagramFeed showViewMore={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: "#000",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});