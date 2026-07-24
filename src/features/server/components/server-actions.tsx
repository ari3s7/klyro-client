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
            className="h-12 w-12 rounded-2xl bg-zinc-800 hover:bg-green-600"
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