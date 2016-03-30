<?php

N2Loader::import('libraries.slider.generator.abstract', 'smartslider');

class N2GeneratorWooCommerceProductsByFilter extends N2GeneratorAbstract
{

    protected function _getData($count, $startIndex) {
        $data = array();

        $categories = explode('||', $this->data->get('categories', ''));

        $tax_query = array();
        if (!in_array(0, $categories)) {
            $tax_query[] = array(
                'taxonomy' => 'product_cat',
                'field'    => 'term_id',
                'terms'    => $categories
            );
        }

        $tags = explode('||', $this->data->get('tags', ''));

        if (!in_array(0, $tags)) {
            $tax_query[] = array(
                'taxonomy' => 'product_tag',
                'field'    => 'term_id',
                'terms'    => $tags
            );
        }

        $meta_query = array();

        $order = explode("|*|", $this->data->get('categoryorder', 'creation_date|*|desc'));
        if (substr($order[0], 0, 1) == '_') {
            $orderBy      = 'meta_value_num'; //meta_value = strval, meta_value_num = intval
            $meta_query[] = array(
                'key'     => $order[0],
                'compare' => 'LIKE'
            );
        } else {
            $orderBy = $order[0];
        }

        switch ($this->data->get('instock', '1')) {
            case 1:
                $meta_query[] = array(
                    'key'   => '_stock_status',
                    'value' => 'instock'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'   => '_stock_status',
                    'value' => 'outofstock'
                );
                break;
        }

        switch ($this->data->get('downloadable', '0')) {
            case 1:
                $meta_query[] = array(
                    'key'   => '_downloadable',
                    'value' => 'yes'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'   => '_downloadable',
                    'value' => 'no'
                );
                break;
        }

        switch ($this->data->get('virtual', '0')) {
            case 1:
                $meta_query[] = array(
                    'key'   => '_virtual',
                    'value' => 'yes'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'   => '_virtual',
                    'value' => 'no'
                );
                break;
        }

        switch ($this->data->get('featured', '0')) {
            case 1:
                $meta_query[] = array(
                    'key'   => '_featured',
                    'value' => 'yes'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'   => '_featured',
                    'value' => 'no'
                );
                break;
        }

        $args = array(
            'offset'         => $startIndex,
            'posts_per_page' => $count,
            'orderby'        => $orderBy,
            'order'          => $order[1],
            'post_type'      => 'product',
            'tax_query'      => $tax_query,
            'meta_query'     => $meta_query
        );

        $productFactory = new WC_Product_Factory();
        $i              = 0;
        $posts          = get_posts($args);
        for ($j = 0; $j < count($posts); $j++) {
            $product = $productFactory->get_product($posts[$j]);
            if ($product && $product->is_visible()) {
                $image     = wp_get_attachment_url(get_post_thumbnail_id($product->id));
                $thumbnail = wp_get_attachment_image_src(get_post_thumbnail_id($product->id, 'thumbnail'));
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
                    $data[$i]['sale_price'] = $data[$j]['price'];
                }

                $data[$i]['ID'] = $product->id;

                $i++;
            }
        }

        return $data;
    }

}
