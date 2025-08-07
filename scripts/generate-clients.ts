import { createFromRoot } from 'codama';
import { rootNodeFromAnchor, AnchorIdl } from '@codama/nodes-from-anchor';
import { renderVisitor as renderJavaScriptVisitor } from "@codama/renderers-js";
import anchorIdl from '../target/idl/capstone_airpay_q3.json';
import path from 'path';

const codama = createFromRoot(rootNodeFromAnchor(anchorIdl as AnchorIdl));

const jsClient = path.join(__dirname, "..", "phoenix_dapp", "assets", "clients");
codama.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "capstone_airpay_q3"))
);
