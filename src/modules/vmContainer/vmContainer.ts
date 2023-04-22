import { Vm } from "../vm/vm";

class VmContainer {
    private vms: Vm[] = [];

    add(vm: Vm) {
        this.vms.push(vm);
    }

    delete(index: number) {
        this.vms.splice(index, 1);
    }

    at(index: number) {
        return this.vms[index];
    }
}

export default new VmContainer();
