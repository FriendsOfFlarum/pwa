<?php

namespace FoF\PWA\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extension\Extension;
use Flarum\Foundation\ContainerUtil;
use FoF\PWA\ManifestBuilder;
use Illuminate\Contracts\Container\Container;

class Manifest implements ExtenderInterface
{
    /** @var list<callable|class-string> */
    private array $callbacks = [];

    /**
     * Modify the completed manifest, including the admin preview.
     *
     * Callbacks run in registration order, each receiving the previous result.
     * Invokable classes are resolved through the container when called.
     *
     * @param (callable(array<string, mixed>): array<string, mixed>)|class-string $callback
     */
    public function modify(callable|string $callback): self
    {
        $this->callbacks[] = $callback;

        return $this;
    }

    public function extend(Container $container, ?Extension $extension = null): void
    {
        $container->resolving(ManifestBuilder::class, function (ManifestBuilder $builder, Container $container) {
            foreach ($this->callbacks as $callback) {
                $builder->modify(ContainerUtil::wrapCallback($callback, $container));
            }
        });
    }
}
