import app from "./app";
import { config } from "./common/config/env";

const PORT = config.port || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
