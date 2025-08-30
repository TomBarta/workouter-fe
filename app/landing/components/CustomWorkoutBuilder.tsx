import { BlockCard } from "./BlockCard";
import { Block } from "./types";
import { createDefaultBlock } from "./utils";

interface CustomWorkoutBuilderProps {
    blocks: Block[];
    onUpdate: (blocks: Block[]) => void;
}

export const CustomWorkoutBuilder = ({
    blocks,
    onUpdate
}: CustomWorkoutBuilderProps): JSX.Element => {
    const addBlock = () => {
        onUpdate([...blocks, createDefaultBlock()]);
    };

    const updateBlock = (blockId: string, updates: Partial<Block>) => {
        const updatedBlocks = blocks.map(block =>
            block.id === blockId ? { ...block, ...updates } : block
        );
        onUpdate(updatedBlocks);
    };

    const removeBlock = (blockId: string) => {
        if (blocks.length > 1) {
            const updatedBlocks = blocks.filter(block => block.id !== blockId);
            onUpdate(updatedBlocks);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center">
                <p className="text-wktr-black-600 font-bold">
                    Add blocks and steps. <br /> Each block can repeat.
                </p>
            </div>

            <div className="space-y-6">
                {blocks.map((block) => (
                    <div key={block.id}>
                        <BlockCard
                            block={block}
                            onUpdate={(updatedBlock) => updateBlock(block.id, updatedBlock)}
                            onRemove={() => removeBlock(block.id)}
                            canRemove={blocks.length > 1}
                        />
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <button
                    type="button"
                    onClick={addBlock}
                    className="btn btn-lg btn-brand hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    Add New Block
                </button>
            </div>
        </div>
    );
};
