<?php

class N2GeneratorWooCommerceProductsByIds extends N2GeneratorAbstract
{

    protected function _getData($count, $startIndex) {
        $productFactory = new WC_Product_Factory();
        $i              = 0;
        $data           = array();

        foreach ($this->getIDs() AS $id) {
            $product = $productFactory->get_product($id);
            if ($product && $product->is_visible()) {
                $image     = wp_get_attachment_url(get_post_thumbnail_id($id));
                $thumbnail = wp_get_attachment_image_src(get_post_thumbnail_id($id, 'thumbnail'));
                if ($thumbnail[0] != null) {
                    $thumbnail = $thumbnail[0];
                } else {
                    $thumbnail = $image;
                }

                $data[$i] = array(
                    'title'         => $product->get_title(),
                    'url'           => $product->get_permalink(),
                    'description'   => $product->get_post_data()->post_content,
                    'image'         => N2ImageHelper::dynamic($image),
                    'thumbnail'     => N2ImageHelper::dynamic($thumbnail),
                    'price'         => wc_price($product->get_price()),
                    'regular_price' => wc_price($product->get_regular_price())
                );

                if ($product->is_on_sale()) {
                    $data[$i]['sale_price'] = wc_price($product->get_sale_price());
                } else {
                    $data[$i]['sale_price'] = $data[$i]['price'];
                }

                $data[$i]['ID'] = $product->id;

                $i++;
            }
        }
        return $data;
    }

}
