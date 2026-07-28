import { useState } from "react";
import { Plus } from "lucide-react";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import CreateServerDialog from "./create-server-dialog";
import JoinServerDialog from "./join-server-dialog";

export default function ServerActions() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger >
          <Button
            size="icon"
            className="h-10 w-10 md:h-12 md:w-12 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-cyan-500/30 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={() => setCreateOpen(true)}>
            Create Server
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setJoinOpen(true)}>
            Join Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateServerDialog
        open={createOpen}
        setOpen={setCreateOpen}
      />

      <JoinServerDialog
        open={joinOpen}
        setOpen={setJoinOpen}
      />
    </>
  );
}