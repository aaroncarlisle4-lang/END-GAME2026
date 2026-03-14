import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { useCaseVivaData } from "../../hooks/useCaseVivaData";
import { VivaScript } from "./VivaScript";
import { VivaDiscriminators } from "./VivaDiscriminators";
import { VivaOBrien } from "./VivaOBrien";
import { VivaMnemonic } from "./VivaMnemonic";

type LongCase = Doc<"longCases">;

interface VivaOverlayProps {
  open: boolean;
  onClose: () => void;
  caseData: LongCase;
}

export function VivaOverlay({ open, onClose, caseData }: VivaOverlayProps) {
  const { discriminator, obrienPattern, mnemonic, isLoading } = useCaseVivaData(caseData, open);

  const hasAnyContent =
    caseData.vivaPresentation ||
    discriminator ||
    obrienPattern ||
    mnemonic;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-40">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20" />
        </TransitionChild>

        {/* Slide-over panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="w-screen max-w-lg sm:max-w-xl lg:max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-teal-700 px-5 py-4 flex items-center justify-between">
                      <div>
                        <DialogTitle className="text-lg font-semibold text-white">
                          Viva Practice
                        </DialogTitle>
                        <p className="text-xs text-teal-200 mt-0.5 truncate max-w-xs">
                          {caseData.title}
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-teal-200 hover:text-white hover:bg-teal-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-5 py-5 space-y-6">
                      {isLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : !hasAnyContent && !caseData.vivaPresentation ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <X className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No viva content yet</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Viva practice material for this case is coming soon.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Viva Presentation Script */}
                          <VivaScript caseData={caseData} />

                          {/* Discriminator Table */}
                          <VivaDiscriminators discriminator={discriminator} />

                          {/* O'Brien Top-3 */}
                          <VivaOBrien pattern={obrienPattern} />

                          {/* Mnemonic */}
                          <VivaMnemonic mnemonic={mnemonic} />
                        </>
                      )}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
