import { Vm } from "../vm/vm";

type Resolve = (value: string | PromiseLike<string>) => void;

class VmContainer {
    private vms: Vm[] = [];
    private resolves: Array<Resolve | null> = [];

    add(vm: Vm) {
        this.vms.push(vm);
        this.resolves.push(null);
    }

    delete(index: number) {
        this.vms.splice(index, 1);
        this.resolves.splice(index, 1);
    }

    at(index: number) {
        return this.vms[index];
    }

    resolvesAt(index: number) {
        return this.resolves[index];
    }

    setResolveAt(index: number, resolve: Resolve) {
        this.resolves[index] = resolve;
    }
}

export default new VmContainer();
